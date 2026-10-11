/**
 * AI Agent - n8n-style "AI Agent" node: an LLM that loops, calling tools until it has an answer.
 *
 * Provider-agnostic: ai.service has no native tool calling (groq/openai/grok/gemini cascade),
 * so the model replies with one JSON object per step: {"tool","input"} or {"final"}.
 * ponytail: JSON-protocol tool calls; switch to native tool calling if the parse-failure rate is high.
 */

const AIService = require('./ai.service');
const AIBlogService = require('./aiBlog.service');
const SEOResearchService = require('./seoResearch.service');
const db = require('../config/database');

const OBSERVATION_LIMIT = 4000;

// Each tool: description + input shape shown to the model, run(input, opts) -> JSON-able result.
const TOOLS = {
    keyword_research: {
        description: 'Real Google Autocomplete searches for seed keywords. Use to find what buyers actually search.',
        input: '{"seeds": ["crm for clinic", "lead follow up"], "limit": 30}',
        run: input => SEOResearchService.autocompleteIdeas(input.seeds || [], { limit: Number(input.limit) || 30 }),
    },
    gsc_opportunities: {
        description: 'Queries our site already appears for in Google at positions 4-20 (easiest wins), with page and impressions.',
        input: '{"days": 28, "max_position": 20}',
        run: input => SEOResearchService.gscOpportunities({
            days: Number(input.days) || 28,
            maxPos: Number(input.max_position) || 20,
        }),
    },
    list_blog_posts: {
        description: 'Titles and slugs of our existing blog posts (published and draft). Use to avoid duplicates.',
        input: '{"limit": 50}',
        run: async input => {
            const [rows] = await db.query(
                'SELECT title, slug, status FROM blogs ORDER BY created_at DESC LIMIT ?',
                [Math.min(Number(input.limit) || 50, 200)]
            );
            return rows;
        },
    },
    write_blog_draft: {
        description: 'Write a full blog post and save it as a DRAFT for human review (never published). Call at most once.',
        input: '{"topic": "Title targeting the keyword", "keywords": ["primary keyword", "secondary"], "outline": ["Section 1", "Section 2"], "image_query": "2-4 word photo scene"}',
        run: async (input, opts) => {
            if (!input.topic) throw new Error('topic is required');
            if (opts.draftsWritten >= opts.maxDrafts) throw new Error(`draft limit reached (${opts.maxDrafts}) for this run`);
            const blog = await AIBlogService.writeBlog(
                { topic: input.topic, keywords: input.keywords || [], outline: input.outline || [], imageQuery: input.image_query },
                { model: opts.model, brandContext: opts.brandContext }
            );
            const image = await AIBlogService.fetchUnsplashImage(blog.imageQuery);
            const saved = await AIBlogService.postBlog({
                ...blog,
                image: image.url,
                keywords: input.keywords || [],
                author: opts.author || 'Team Napnix',
                status: 'draft',
            });
            opts.draftsWritten++;
            return { id: saved.id, slug: saved.slug, title: saved.title, status: 'draft' };
        },
    },
    http_get: {
        description: 'GET a URL and return its body (JSON or text, truncated). Only hosts on the allowlist work.',
        input: '{"url": "https://..."}',
        run: async (input, opts) => {
            const url = new URL(input.url);
            // Allowlist guards against prompt-injected exfiltration (fetched content can contain instructions)
            if (!opts.allowedHosts.includes(url.hostname)) {
                throw new Error(`host ${url.hostname} not in allowlist: ${opts.allowedHosts.join(', ') || '(empty)'}`);
            }
            const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
            const text = await res.text();
            try { return { status: res.status, body: JSON.parse(text) }; } catch (e) { return { status: res.status, body: text }; }
        },
    },
};

function extractJson(text) {
    const cleaned = String(text).replace(/```(?:json)?/g, '').trim();
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start === -1 || end <= start) throw new Error('no JSON object in reply');
    return JSON.parse(cleaned.slice(start, end + 1));
}

const truncate = (value, n = OBSERVATION_LIMIT) => {
    const s = typeof value === 'string' ? value : JSON.stringify(value);
    return s.length > n ? `${s.slice(0, n)}... [truncated]` : s;
};

class AIAgentService {
    get toolNames() { return Object.keys(TOOLS); }

    /**
     * @param {object} cfg goal, tools[], systemMessage, model, maxSteps, brandContext, allowedHosts[], author
     * @param {object} contextData workflow data from previous nodes
     * @returns {Promise<{final: string, steps: object[]}>}
     */
    async run(cfg, contextData = {}) {
        // http_get is opt-in only
        const defaults = this.toolNames.filter(t => t !== 'http_get');
        const enabled = (cfg.tools && cfg.tools.length ? cfg.tools : defaults).filter(t => TOOLS[t]);
        const maxSteps = Math.min(Number(cfg.maxSteps) || 6, 15);
        // Tools that must succeed before a final answer is accepted (models like to skip work and claim it)
        const required = (cfg.requireTools || []).filter(t => enabled.includes(t));
        const opts = {
            model: cfg.model || null,
            brandContext: cfg.brandContext || null,
            allowedHosts: cfg.allowedHosts || [],
            author: cfg.author,
            maxDrafts: Number(cfg.maxDrafts) || 1,
            draftsWritten: 0,
        };

        const toolDocs = enabled.map(name => `- ${name}: ${TOOLS[name].description}\n  input: ${TOOLS[name].input}`).join('\n');
        const system = `${cfg.systemMessage || 'You are an autonomous assistant for Napnix.'}

You work in steps. At each step reply with EXACTLY ONE JSON object and nothing else:
  {"thought": "short reasoning", "tool": "<tool name>", "input": { ... }}
or, when you are done:
  {"thought": "short reasoning", "final": "your final answer for the user"}

Available tools:
${toolDocs}

Rules:
- Only use the tools listed. If a tool fails, try another tool; do not guess what it would have returned.
- Every fact in your final answer must come from a tool result above. Never state search volumes,
  rankings, counts or "not covered" claims you did not get from a tool.
- Never say you did something (wrote, saved, checked) unless a tool result shows it happened.${required.length ? `
- You MUST successfully call these tools before giving a final answer: ${required.join(', ')}.` : ''}
- Stop as soon as the goal is met.`;

        const steps = [];
        const succeeded = new Set();
        for (let i = 0; i < maxSteps; i++) {
            const transcript = steps.map((s, n) =>
                `Step ${n + 1}: ${s.tool ? `called ${s.tool} with ${JSON.stringify(s.input)}\nResult: ${s.observation}` : s.observation}`
            ).join('\n\n');

            const prompt = `GOAL:\n${cfg.goal}\n\nWORKFLOW DATA:\n${truncate(contextData, 3000)}\n\n${transcript ? `PREVIOUS STEPS:\n${transcript}\n\n` : ''}Steps left: ${maxSteps - i}. Reply with the next JSON object.`;
            const reply = await AIService.generateContent(prompt, system, opts.model);

            let action;
            try {
                action = extractJson(reply);
            } catch (e) {
                steps.push({ observation: `Your reply was not valid JSON (${e.message}). Reply with one JSON object only.` });
                continue;
            }

            if (action.final !== undefined) {
                const missing = required.filter(t => !succeeded.has(t));
                if (missing.length) {
                    steps.push({ thought: action.thought, observation: `Final answer rejected: you have not successfully called ${missing.join(', ')} yet. Call it now.` });
                    continue;
                }
                steps.push({ thought: action.thought, final: action.final });
                return { final: String(action.final), steps, completed: true };
            }

            const tool = TOOLS[action.tool];
            if (!tool || !enabled.includes(action.tool)) {
                steps.push({ thought: action.thought, tool: action.tool, input: action.input, observation: `Error: unknown or disabled tool. Available: ${enabled.join(', ')}` });
                continue;
            }

            let observation;
            try {
                observation = truncate(await tool.run(action.input || {}, opts));
                succeeded.add(action.tool);
            } catch (e) {
                observation = `Error: ${e.message}`;
            }
            console.log(`[AIAgent] step ${i + 1}: ${action.tool} -> ${observation.slice(0, 120)}`);
            steps.push({ thought: action.thought, tool: action.tool, input: action.input, observation });
        }

        return { final: `Stopped after ${maxSteps} steps without a final answer.`, steps, completed: false };
    }
}

module.exports = new AIAgentService();
module.exports.extractJson = extractJson;
