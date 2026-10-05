import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'napnix_currency';
const CACHE_TTL = 24 * 60 * 60 * 1000;

const CURRENCIES = {
    INR: { symbol: '₹', code: 'INR', label: 'INR' },
    USD: { symbol: '$', code: 'USD', label: 'USD' },
    EUR: { symbol: '€', code: 'EUR', label: 'EUR' },
};

/**
 * IANA timezone prefix -> currency, used instead of a network geo lookup.
 *
 * This replaced `fetch('http://ip-api.com/json/?fields=countryCode')`, which
 * could never have worked: the site is served over HTTPS and that request is
 * plain HTTP, so every browser blocks it as mixed content. The catch swallowed
 * the error silently, the state never updated, and the result was that *every*
 * visitor — including the Indian market that supplies most of the site's search
 * traffic — saw USD prices, while the Offer markup on the same page quoted INR.
 *
 * ip-api.com has no HTTPS on its free tier, so there was no drop-in fix.
 * Intl.DateTimeFormat gives the visitor's timezone with no request, no
 * third-party dependency, no API key and nothing to rate-limit, which is enough
 * to pick a currency. The switcher still lets anyone override it, and a manual
 * choice is remembered.
 */
const TIMEZONE_CURRENCY_PREFIXES = [
    ['Asia/Kolkata', 'INR'],
    ['Asia/Calcutta', 'INR'],
    ['Europe/', 'EUR'],
    ['America/', 'USD'],
    ['Australia/', 'USD'],
    ['Pacific/', 'USD'],
    ['Asia/Singapore', 'USD'],
];

function detectCurrencyFromTimezone() {
    try {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
        const hit = TIMEZONE_CURRENCY_PREFIXES.find(([prefix]) => tz.startsWith(prefix));
        if (hit) return hit[1];
    } catch {
        // Intl unavailable — fall through to the default.
    }
    return null;
}

function getStoredCurrency() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return null;
        const { code, timestamp, manual } = JSON.parse(stored);
        if (manual) return code;
        if (Date.now() - timestamp < CACHE_TTL) return code;
        return null;
    } catch {
        return null;
    }
}

function storeCurrency(code, manual = false) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ code, timestamp: Date.now(), manual }));
    } catch {}
}

export default function useCurrency() {
    /**
     * INR is the default, not USD.
     *
     * The prerendered HTML is built with whatever this initial value is, and
     * that HTML is what Googlebot's first pass, every non-JS AI crawler and the
     * `/napcrm/pricing` title tag all read. With USD the page shipped "$49"
     * while its own AggregateOffer said "INR 4165", and the business is in
     * Mohali billing Indian clients. INR makes the static price, the schema,
     * the meta title and the primary market agree.
     *
     * Visitors elsewhere are switched by detectCurrencyFromTimezone below, which
     * runs before paint.
     */
    const [currency, setCurrencyState] = useState(() => getStoredCurrency() || 'INR');

    useEffect(() => {
        const stored = getStoredCurrency();
        if (stored) return;

        const detected = detectCurrencyFromTimezone();
        if (detected && detected !== currency) {
            setCurrencyState(detected);
            storeCurrency(detected, false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const setCurrency = useCallback((code) => {
        if (CURRENCIES[code]) {
            setCurrencyState(code);
            storeCurrency(code, true);
        }
    }, []);

    const { symbol } = CURRENCIES[currency] || CURRENCIES.INR;

    const formatPrice = useCallback((price) => {
        if (price === null || price === undefined) return null;
        if (currency === 'INR') {
            return price.toLocaleString('en-IN');
        }
        return price.toLocaleString('en-US');
    }, [currency]);

    return { currency, setCurrency, symbol, formatPrice, currencies: CURRENCIES };
}
