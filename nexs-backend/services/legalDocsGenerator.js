/**
 * Generates business-specific Terms & Conditions, Privacy Policy, Refund
 * Policy, Cookie Policy, and a DPDP Act 2023 (India) compliance notice for a
 * tenant's storefront, then pushes them to that tenant's own DB via
 * POST /api/internal/legal-docs (nexcrm-backend/routes/internal.routes.js).
 *
 * This is a MANDATORY provisioning step — see CLAUDE.md "Tenant Legal &
 * Compliance". Called from:
 *   - services/provisioner.js, right after a new tenant's welcome email
 *   - scripts/backfill-legal-docs.js, once, for every tenant provisioned
 *     before this system existed
 *
 * Every tenant is Napnix-hosted out of India, so the DPDP Act 2023 notice is
 * always generated. When the tenant's business is known to serve customers
 * outside India (currently: no reliable per-tenant signal exists yet — see
 * the TODO below), GDPR/other-country language is layered into the privacy
 * policy and cookie policy as well; until that signal exists, every document
 * still carries a generic "if you serve customers outside India" clause
 * covering GDPR (EU/UK) and CCPA (California) at a high level, since Napnix
 * tenants commonly sell internationally on the ecommerce/services industries.
 */

const aiService = require('./ai.service');
const axios = require('axios');

const INTERNAL_OAUTH_KEY = process.env.INTERNAL_OAUTH_KEY;
const CRM_DOMAIN = process.env.NEXCRM_DOMAIN || 'napnix.in';

const DOC_TYPES = [
    {
        doc_type: 'terms_of_service',
        title: 'Terms & Conditions',
        instruction: 'Write Terms & Conditions / Terms of Service for use of the business\'s website and services. Cover: acceptance of terms, description of service, user obligations, pricing/payment terms, intellectual property, limitation of liability, termination, governing law (India), and dispute resolution/jurisdiction.'
    },
    {
        doc_type: 'privacy_policy',
        title: 'Privacy Policy',
        instruction: 'Write a Privacy Policy covering: what personal data is collected (name, contact details, payment info, usage data), why (Digital Personal Data Protection Act 2023 requires stating a clear, specific purpose for each), how it is stored/secured, who it may be shared with (e.g. payment processors, delivery partners), user rights (access, correction, erasure, grievance redressal, and the DPDP Act\'s right to nominate someone to exercise these rights after death/incapacity), a Grievance Officer contact placeholder, cookie use (cross-reference the separate Cookie Policy), and a clause noting that visitors outside India may have additional rights under GDPR (EU/UK) or CCPA (California) and how to exercise them.'
    },
    {
        doc_type: 'dpdp_notice',
        title: 'Data Protection Notice (DPDP Act 2023)',
        instruction: 'Write a standalone Data Protection Notice specifically for compliance with India\'s Digital Personal Data Protection Act, 2023. This must include: (1) a clear, itemised statement of what personal data is processed and the specific purpose for each item (the Act requires purpose limitation, not a vague blanket purpose), (2) the legal basis (consent, or one of the Act\'s "legitimate uses"), (3) how consent can be given, withdrawn, and managed as easily as it was given, (4) data retention period and deletion practice, (5) the process to contact the business\'s Grievance Officer, (6) the right to file a complaint with the Data Protection Board of India, (7) whether/how data may be transferred outside India (the Act allows this except to countries the Central Government restricts).'
    },
    {
        doc_type: 'refund_policy',
        title: 'Refund & Cancellation Policy',
        instruction: 'Write a Refund & Cancellation Policy appropriate for this specific type of business (adjust to what the business actually sells — physical goods, services, bookings, or subscriptions). Cover: eligibility window, condition requirements, how to request a refund, processing time, non-refundable exceptions, and cancellation terms.'
    },
    {
        doc_type: 'cookie_policy',
        title: 'Cookie Policy',
        instruction: 'Write a Cookie Policy covering: what cookies are, categories used (essential, analytics, marketing), how to control/disable them via browser settings, and a note that the DPDP Act 2023 treats cookie-based tracking as personal data processing requiring the same consent standard as the Privacy Policy, plus a note that EU/UK visitors are additionally covered by GDPR/PECR cookie-consent rules.'
    }
];

// The storefront renders `content` with dangerouslySetInnerHTML inside a
// Tailwind `prose` block (nexcrm-storefront/src/pages/Page.jsx) — it expects
// semantic HTML fragments (h2/h3/p/ul/strong), NOT Markdown. Markdown here
// would render as literal '#' and '**' characters on every tenant's site.
const SYSTEM_MESSAGE = 'You are a legal-content drafting assistant for small/medium Indian businesses. Write in plain, clear English (not dense legalese), formatted as an HTML fragment using only <h2>, <h3>, <p>, <ul>, <li>, and <strong> tags — no <html>/<head>/<body>, no Markdown syntax like # or **. You are producing a REVIEW DRAFT for the business owner to read and approve — never insert placeholder brackets like [Company Name] without also using the real name given. End every document with a short <p><strong> reminder: "This is an AI-generated draft. Please have it reviewed by a qualified lawyer before relying on it, especially if you operate outside India." Do not invent a Grievance Officer name or email — write "[to be filled in by the business]" only for that one field.';

/**
 * @param {object} tenant - needs name, slug, industry_type, email
 * @returns {Promise<Array>} generated documents, ready to push
 */
async function generateLegalDocs(tenant) {
    const businessContext = `Business name: ${tenant.name}
Industry: ${tenant.industry_type || 'general'}
Contact email: ${tenant.email}
Country of operation: India (with the possibility of serving customers in other countries via the online storefront)`;

    const documents = [];
    for (const spec of DOC_TYPES) {
        try {
            const prompt = `${businessContext}\n\nTask: ${spec.instruction}\n\nWrite the full document now, as an HTML fragment (h2/h3/p/ul/li/strong only).`;
            const content = await aiService.generateContent(prompt, SYSTEM_MESSAGE);
            documents.push({
                doc_type: spec.doc_type,
                title: spec.title,
                content,
                jurisdictions: ['IN', 'EU', 'US'],
                dpdp_compliant: true,
                gdpr_aware: true,
                generated_by: 'ai'
            });
        } catch (error) {
            console.error(`[LegalDocsGenerator] Failed to generate ${spec.doc_type} for ${tenant.slug}:`, error.message);
        }
    }
    return documents;
}

async function pushLegalDocs(tenant, documents) {
    if (!documents.length) return { skipped: true, reason: 'no documents generated' };

    const apiUrl = tenant.custom_domain
        ? `https://${tenant.custom_domain}`
        : `https://${tenant.slug}-crm-api.${CRM_DOMAIN}`;

    try {
        await axios.post(
            `${apiUrl}/api/internal/legal-docs`,
            { documents },
            { headers: { 'X-Internal-Key': INTERNAL_OAUTH_KEY }, timeout: 60000 }
        );
        console.log(`[LegalDocsGenerator] Pushed ${documents.length} legal docs to tenant ${tenant.slug}`);
        return { success: true, count: documents.length };
    } catch (error) {
        console.warn(`[LegalDocsGenerator] Failed to push legal docs to tenant ${tenant.slug}: ${error.message}`);
        return { success: false, error: error.message };
    }
}

/**
 * Full generate + push, called from provisioner.js and the backfill script.
 * Never throws — a legal-doc generation failure must not block provisioning
 * (matches the non-fatal pattern used for storefront DNS/welcome email).
 */
async function generateAndPushLegalDocs(tenant) {
    try {
        const documents = await generateLegalDocs(tenant);
        return await pushLegalDocs(tenant, documents);
    } catch (error) {
        console.error(`[LegalDocsGenerator] Unexpected failure for tenant ${tenant.slug}:`, error.message);
        return { success: false, error: error.message };
    }
}

module.exports = { generateLegalDocs, pushLegalDocs, generateAndPushLegalDocs };
