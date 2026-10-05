/**
 * Generate public/llms.txt and public/llms-full.txt from the app's own constants.
 *
 * Why generate rather than hand-maintain: both files had drifted badly from the
 * product. llms.txt advertised NapCRM "from ₹999/month" and llms-full.txt
 * repeated that in a table, while crmPricing.js — the data the pricing page and
 * the Offer schema both render from — says the Starter tier is ₹4,165 / $49.
 * Every plan limit in that table was wrong too, and the NapMail section
 * described a page that was not routed. An llms.txt is read by systems that
 * cannot cross-check it, so a stale one is worse than none: it hands an answer
 * engine a confident wrong price.
 *
 * Google's AI-optimization guidance is explicit that llms.txt is not a Google
 * Search ranking or citation lever, so this is not an SEO play. It is kept for
 * non-Google consumers, and kept correct.
 *
 * Prices are stated in USD because that is the currency the site's own meta
 * description quotes, with INR alongside since the business is India-based and
 * INR is the schema's priceCurrency. Both come from one source, so they cannot
 * disagree.
 *
 * Run before `vite build` so the generated files are copied from public/.
 */

import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { crmTiers } from '../src/constants/crmPricing.js';
import { nexmailTiers as napmailTiers } from '../src/constants/napmailPricing.js';
import { BLOG_POSTS_BY_RECENCY } from '../src/constants/blogPosts.js';
import { INDUSTRY_SLUGS, CITY_SLUGS } from '../src/constants/sitemapRoutes.js';

const SITE = 'https://napnix.in';
const PUBLIC = join(process.cwd(), 'public');

const usd = (n) => (n == null ? 'Custom' : `$${n}`);
const inr = (n) => (n == null ? 'Custom' : `₹${n.toLocaleString('en-IN')}`);

/** "$49/month (₹4,165)" — or "Custom" for the Enterprise tier. */
function priceLabel(tier) {
    const m = tier.price.monthly;
    if (m.USD == null && m.INR == null) return 'Custom pricing';
    return `${usd(m.USD)}/month (${inr(m.INR)})`;
}

function paidTiers(tiers) {
    return tiers.filter((t) => t.price.monthly.USD != null && t.price.monthly.USD > 0);
}

/** Entry and top paid tier, for the one-line product summary. */
function priceRange(tiers) {
    const paid = paidTiers(tiers);
    if (!paid.length) return 'Custom pricing';
    const first = paid[0];
    const last = paid[paid.length - 1];
    const free = tiers.some((t) => t.price.monthly.USD === 0) ? 'Free plan available, then ' : '';
    return `${free}${priceLabel(first)} to ${priceLabel(last)}, plus a custom Enterprise tier`;
}

const INDUSTRY_LABELS = {
    general: 'Small Business', ecommerce: 'E-commerce', realestate: 'Real Estate',
    services: 'Service Businesses', education: 'Education', healthcare: 'Healthcare',
    hospitality: 'Hospitality', travel: 'Travel', fitness: 'Fitness', legal: 'Legal',
    manufacturing: 'Manufacturing', logistics: 'Logistics', restaurant: 'Restaurants',
    salon: 'Salons & Spas',
};

const CITY_LABELS = {
    mohali: 'Mohali', chandigarh: 'Chandigarh', london: 'London', 'new-york': 'New York',
    bangalore: 'Bangalore', dubai: 'Dubai', sydney: 'Sydney', toronto: 'Toronto',
};

const SERVICES = [
    ['custom-web-development', 'Custom Web Development', 'Full-stack web applications — React, Next.js, Node.js, Python, cloud-native architectures.'],
    ['mobile-app-development', 'Mobile App Development', 'iOS, Android and cross-platform apps using React Native and Flutter.'],
    ['ecommerce-development', 'E-commerce Development', 'Shopify, WooCommerce, headless commerce and custom marketplace platforms.'],
    ['cloud-solutions', 'Cloud Solutions', 'AWS, Azure and GCP infrastructure, DevOps, CI/CD pipelines, containerisation.'],
    ['ai-machine-learning', 'AI & Machine Learning', 'Custom models, NLP, computer vision, predictive analytics and ML pipelines.'],
];

function llmsTxt() {
    const L = [];
    L.push('# Napnix (Napix)');
    L.push('');
    L.push('> Napnix — also commonly searched as Napix — is an India-based software development company building custom web applications, mobile apps, cloud infrastructure, AI/ML solutions, NapCRM, and NapMail.');
    L.push('');
    L.push('Napnix specialises in end-to-end digital product development for startups and enterprises. Founded in 2025, headquartered at 2519 Azad Nagar, Balongi, Sahibzada Ajit Singh Nagar (Mohali), Punjab 160055, India. Core expertise: React, Node.js, Flutter, AWS, AI/ML. Contact: info@napnix.in | +91 6239396615.');
    L.push('');
    L.push('## Products');
    L.push('');
    L.push(`- [NapCRM](${SITE}/napcrm): Industry-specific CRM platform with lead management, e-commerce tools, automation, and multi-channel communication. ${priceRange(crmTiers)}.`);
    L.push(`- [NapCRM Pricing](${SITE}/napcrm/pricing): Feature comparison across ${crmTiers.map((t) => t.name).join(', ')} plans, with yearly discount options.`);
    L.push(`- [NapMail](${SITE}/napmail): Email marketing engine with smart SMTP rotation, anti-spam scoring, per-domain throttling, a visual automation builder, and NapCRM integration. ${priceRange(napmailTiers)}.`);
    L.push('');
    L.push('## NapCRM Plans');
    L.push('');
    for (const tier of crmTiers) {
        const lim = tier.limits;
        L.push(`- **${tier.name}** — ${priceLabel(tier)}. ${lim.leads} leads, ${lim.customers} customers, ${lim.products} products, ${lim.teamMembers} team members, ${lim.storage} storage.`);
    }
    L.push('');
    L.push('## Services');
    L.push('');
    for (const [slug, name, desc] of SERVICES) {
        L.push(`- [${name}](${SITE}/services/${slug}): ${desc}`);
    }
    L.push('');
    L.push('## NapCRM Industry Solutions');
    L.push('');
    for (const slug of INDUSTRY_SLUGS) {
        L.push(`- [CRM for ${INDUSTRY_LABELS[slug] ?? slug}](${SITE}/napcrm/industries/${slug})`);
    }
    L.push('');
    L.push('## Locations');
    L.push('');
    for (const slug of CITY_SLUGS) {
        const hq = slug === 'mohali' ? ' (headquarters)' : '';
        L.push(`- [Software Development in ${CITY_LABELS[slug] ?? slug}](${SITE}/software-development-company/${slug})${hq}`);
    }
    L.push('');
    L.push('## Company');
    L.push('');
    L.push(`- [About Us](${SITE}/about): Company story, team, values and mission.`);
    L.push(`- [Portfolio](${SITE}/portfolio): Case studies and delivered projects.`);
    L.push(`- [Contact](${SITE}/contact): Project enquiries and consultation requests.`);
    L.push(`- [FAQ](${SITE}/faq): Common questions about services, pricing and process.`);
    L.push(`- [Security](${SITE}/security): Security practices and policies.`);
    L.push('');
    L.push('## Guides');
    L.push('');
    for (const post of BLOG_POSTS_BY_RECENCY) {
        L.push(`- [${post.title}](${SITE}/blog/${post.slug}): ${post.excerpt} (updated ${post.updated})`);
    }
    L.push('');
    L.push('## Optional');
    L.push('');
    L.push(`- [Privacy Policy](${SITE}/privacy-policy)`);
    L.push(`- [Terms of Service](${SITE}/terms)`);
    L.push('');
    return L.join('\n');
}

function planTable(tiers, limitKeys) {
    const head = ['Plan', 'Monthly (USD)', 'Monthly (INR)', 'Yearly (INR, per month)', ...limitKeys.map((k) => k.label)];
    const rows = tiers.map((t) => [
        t.name,
        usd(t.price.monthly.USD),
        inr(t.price.monthly.INR),
        inr(t.price.yearly.INR),
        ...limitKeys.map((k) => t.limits?.[k.key] ?? '—'),
    ]);
    return [
        `| ${head.join(' | ')} |`,
        `|${head.map(() => '---').join('|')}|`,
        ...rows.map((r) => `| ${r.join(' | ')} |`),
    ].join('\n');
}

function llmsFullTxt() {
    const L = [];
    L.push('# Napnix — Full Reference');
    L.push('');
    L.push(`> Napnix is an India-based software development company building custom web applications, mobile apps, cloud infrastructure and AI/ML solutions. It publishes two products: NapCRM, an industry-specific CRM platform from ${priceLabel(paidTiers(crmTiers)[0])}, and NapMail, an email marketing engine with SMTP rotation and anti-spam scoring.`);
    L.push('');
    L.push(`All prices below are generated from the same source as the pricing pages and the Offer structured data, so they cannot disagree with them. Generated ${new Date().toISOString().slice(0, 10)}.`);
    L.push('');
    L.push('## Company Facts');
    L.push('');
    L.push('- Legal/brand name: Napnix (also searched as Napix)');
    L.push('- Founded: 2025');
    L.push('- Headquarters: 2519 Azad Nagar, Balongi, Sahibzada Ajit Singh Nagar (Mohali), Punjab 160055, India');
    L.push('- Email: info@napnix.in · Phone: +91 6239396615');
    L.push('- Core stack: React, Next.js, Node.js, Python, Flutter, React Native, AWS');
    L.push('');
    L.push('## NapCRM');
    L.push('');
    L.push('NapCRM is a multi-tenant, industry-specific CRM platform. Each tenant gets isolated data, configurable modules and industry-specific workflows, covering lead management, customer records, e-commerce, invoicing, automation and multi-channel communication.');
    L.push('');
    L.push('### NapCRM Pricing');
    L.push('');
    L.push(planTable(crmTiers, [
        { key: 'leads', label: 'Leads' },
        { key: 'customers', label: 'Customers' },
        { key: 'products', label: 'Products' },
        { key: 'teamMembers', label: 'Team members' },
        { key: 'storage', label: 'Storage' },
    ]));
    L.push('');
    L.push(`Pricing page: ${SITE}/napcrm/pricing`);
    L.push('');
    L.push(`### NapCRM Industry Editions`);
    L.push('');
    L.push(`NapCRM ships ${INDUSTRY_SLUGS.length} industry editions: ${INDUSTRY_SLUGS.map((s) => INDUSTRY_LABELS[s] ?? s).join(', ')}.`);
    L.push('');
    L.push('## NapMail');
    L.push('');
    L.push('NapMail is an email marketing platform built for deliverability. It uses smart SMTP rotation, anti-spam scoring, and per-domain throttling to improve inbox placement, and integrates with NapCRM.');
    L.push('');
    L.push('### NapMail Pricing');
    L.push('');
    L.push(planTable(napmailTiers, [
        { key: 'contacts', label: 'Contacts' },
        { key: 'emailsPerMonth', label: 'Emails/month' },
    ]));
    L.push('');
    L.push(`Product page: ${SITE}/napmail`);
    L.push('');
    L.push('## Services');
    L.push('');
    for (const [slug, name, desc] of SERVICES) {
        L.push(`### ${name}`);
        L.push('');
        L.push(desc);
        L.push('');
        L.push(`${SITE}/services/${slug}`);
        L.push('');
    }
    L.push('## Guides');
    L.push('');
    for (const post of BLOG_POSTS_BY_RECENCY) {
        L.push(`### ${post.title}`);
        L.push('');
        L.push(post.excerpt);
        L.push('');
        L.push(`First published ${post.published}, last reviewed ${post.updated}. ${SITE}/blog/${post.slug}`);
        L.push('');
    }
    return L.join('\n');
}

writeFileSync(join(PUBLIC, 'llms.txt'), `${llmsTxt().trimEnd()}\n`, 'utf8');
writeFileSync(join(PUBLIC, 'llms-full.txt'), `${llmsFullTxt().trimEnd()}\n`, 'utf8');

const starter = paidTiers(crmTiers)[0];
console.log(`generate-llms: wrote llms.txt and llms-full.txt (NapCRM entry tier ${priceLabel(starter)})`);
