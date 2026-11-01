// The CRM's public name is now "Napnix CRM". Rewrites the old NapCRM / NexCRM names
// in the portfolio and case-study text the agency site shows. Slugs stay as they
// are (napcrm-legal etc.) so existing /portfolio/:slug links keep working.
// REPLACE is case-sensitive, so lowercase slugs inside the text are untouched.
const COLUMNS = {
    portfolio_projects: ['title', 'category', 'description', 'tags', 'tech_stack', 'client'],
    case_studies: ['title', 'category', 'summary', 'tech', 'problem', 'solution', 'system_flow', 'impact', 'quote_text'],
};

module.exports = async function (connection) {
    for (const [table, columns] of Object.entries(COLUMNS)) {
        const set = columns
            .map((c) => `${c} = REPLACE(REPLACE(${c}, 'NapCRM', 'Napnix CRM'), 'NexCRM', 'Napnix CRM')`)
            .join(', ');
        const where = columns.map((c) => `${c} LIKE '%NapCRM%' OR ${c} LIKE '%NexCRM%'`).join(' OR ');
        await connection.query(`UPDATE ${table} SET ${set} WHERE ${where}`);
    }
};
