/**
 * SEO Research Service
 * Real search-demand inputs for the AI blog workflow:
 *  - gscOpportunities: queries Google already shows us for at positions ~4-20 (striking distance)
 *  - autocompleteIdeas: what people actually type into Google for our seed keywords (free, no key)
 */

const SEOIndexingService = require('./seoIndexing.service');

// %s = seed keyword
const DEFAULT_PATTERNS = ['%s', 'best %s', 'how to %s', '%s for', '%s vs', '%s cost'];

class SEOResearchService {
    async _searchConsole() {
        const creds = await SEOIndexingService.getGoogleCredentials();
        if (!creds) throw new Error('Google service account not configured (settings.google_service_account_json or GOOGLE_SERVICE_ACCOUNT_JSON)');

        const { google } = require('googleapis');
        const scopes = ['https://www.googleapis.com/auth/webmasters.readonly'];
        const auth = creds.startsWith('file:')
            ? new google.auth.GoogleAuth({ keyFile: creds.slice(5), scopes })
            : new google.auth.GoogleAuth({ credentials: JSON.parse(creds), scopes });
        return google.searchconsole({ version: 'v1', auth });
    }

    /**
     * Queries with impressions where we rank between minPos and maxPos.
     * The service account email must be added as a user on the Search Console property.
     */
    async gscOpportunities({ property, days = 28, minImpressions = 5, minPos = 4, maxPos = 20, limit = 25 } = {}) {
        const siteUrl = property || `sc-domain:${await SEOIndexingService.getSiteHost()}`;
        const end = new Date();
        const start = new Date(end.getTime() - days * 86400000);
        const fmt = d => d.toISOString().slice(0, 10);

        const sc = await this._searchConsole();
        const { data } = await sc.searchanalytics.query({
            siteUrl,
            requestBody: {
                startDate: fmt(start),
                endDate: fmt(end),
                dimensions: ['query', 'page'],
                rowLimit: 1000,
            },
        });

        return (data.rows || [])
            .map(r => ({
                query: r.keys[0],
                page: r.keys[1],
                clicks: r.clicks,
                impressions: r.impressions,
                position: Math.round(r.position * 10) / 10,
            }))
            .filter(r => r.impressions >= minImpressions && r.position >= minPos && r.position <= maxPos)
            .sort((a, b) => b.impressions - a.impressions)
            .slice(0, limit);
    }

    async _suggest(q, hl, gl) {
        const url = `https://suggestqueries.google.com/complete/search?client=firefox&hl=${hl}&gl=${gl}&q=${encodeURIComponent(q)}`;
        const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
        if (!res.ok) return [];
        const body = await res.json().catch(() => null);
        return Array.isArray(body?.[1]) ? body[1] : [];
    }

    /**
     * Google Autocomplete for each seed x pattern. Returns unique suggestions.
     */
    async autocompleteIdeas(seeds, { hl = 'en', gl = 'in', patterns = DEFAULT_PATTERNS, limit = 40 } = {}) {
        const cleanSeeds = seeds.map(s => s.trim()).filter(Boolean);
        const perSeed = Math.ceil(limit / Math.max(cleanSeeds.length, 1));
        const seen = new Set();
        const ideas = [];
        for (const seed of cleanSeeds) {
            let taken = 0;
            for (const pattern of patterns) {
                if (taken >= perSeed) break;
                const suggestions = await this._suggest(pattern.replace('%s', seed), hl, gl).catch(() => []);
                for (const s of suggestions) {
                    const key = s.toLowerCase();
                    if (taken < perSeed && !seen.has(key)) { seen.add(key); ideas.push(s); taken++; }
                }
            }
        }
        return ideas.slice(0, limit);
    }
}

module.exports = new SEOResearchService();
