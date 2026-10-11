/**
 * n8n-style {{expressions}} for workflow node configs.
 * {{name}}, {{lead.email}}, {{items.0.title}}. Objects/arrays render as JSON.
 * Unresolved paths are left as-is so handler-level fallbacks still apply.
 */

const EXPR = /\{\{\s*([\w$.-]+)\s*\}\}/g;

function resolvePath(ctx, path) {
    return path.split('.').reduce((obj, key) => (obj == null ? undefined : obj[key]), ctx);
}

function renderTemplate(str, ctx) {
    return str.replace(EXPR, (match, path) => {
        const value = resolvePath(ctx, path);
        if (value === undefined) return match;
        if (value === null) return '';
        return typeof value === 'object' ? JSON.stringify(value) : String(value);
    });
}

function renderDeep(value, ctx) {
    if (typeof value === 'string') return renderTemplate(value, ctx);
    if (Array.isArray(value)) return value.map(v => renderDeep(v, ctx));
    if (value && typeof value === 'object') {
        return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, renderDeep(v, ctx)]));
    }
    return value;
}

module.exports = { renderTemplate, renderDeep, resolvePath };
