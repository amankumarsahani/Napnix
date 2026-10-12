/**
 * Expense Recurring Worker
 * Posts the rows that recurring expense templates owe. Cheap query, so it polls often
 * and the due-date check keeps it idempotent.
 */
const ctrl = require('../controllers/expense.controller');

let timer = null;

async function tick() {
    try {
        const n = await ctrl.generateRecurring();
        if (n) console.log(`[expenses] generated ${n} recurring row(s)`);
    } catch (err) {
        console.error('[expenses] recurring generation failed:', err.message);
    }
}

module.exports = {
    start(intervalMs = 3600000) {
        if (timer) return;
        tick();
        timer = setInterval(tick, intervalMs);
    }
};
