import { useState, useLayoutEffect, useCallback } from 'react';

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
    /**
     * The initial value is the constant 'INR' — it must NOT read localStorage
     * or the timezone.
     *
     * The app hydrates with hydrateRoot, so React's first client render has to
     * produce exactly the markup the prerender wrote. This used to initialise
     * from `getStoredCurrency()`, which means a returning visitor whose stored
     * choice was USD rendered "$49" against prerendered "₹4,165" — a text
     * mismatch on every price on the page, which is the one kind of hydration
     * mismatch React cannot patch in place: it throws away the server markup
     * for that subtree and re-renders it on the client, costing exactly the
     * work hydration exists to avoid.
     *
     * The stored or detected currency is applied in a layout effect below.
     */
    const [currency, setCurrencyState] = useState('INR');

    // useLayoutEffect, not useEffect: it is committed before the browser paints,
    // so a US or EU visitor never sees a flash of rupee prices. There is no
    // server render pass in Node — prerendering drives a real browser — so this
    // raises no SSR warning.
    useLayoutEffect(() => {
        const stored = getStoredCurrency();
        if (stored) {
            if (stored !== 'INR') setCurrencyState(stored);
            return;
        }

        const detected = detectCurrencyFromTimezone();
        if (detected) {
            if (detected !== 'INR') setCurrencyState(detected);
            storeCurrency(detected, false);
        }
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
