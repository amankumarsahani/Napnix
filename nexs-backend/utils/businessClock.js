// Server runs in America/New_York; the business is in India. "Today" must be IST.
const ZONE = process.env.BUSINESS_TIMEZONE || 'Asia/Kolkata';
const fmt = new Intl.DateTimeFormat('en-CA', { timeZone: ZONE, year: 'numeric', month: '2-digit', day: '2-digit' });

/** YYYY-MM-DD in the business timezone. */
const today = (d = new Date()) => fmt.format(d);

module.exports = { today, ZONE };
