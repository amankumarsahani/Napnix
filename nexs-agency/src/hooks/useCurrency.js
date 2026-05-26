import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'napnix_currency';
const CACHE_TTL = 24 * 60 * 60 * 1000;

const CURRENCIES = {
    INR: { symbol: '₹', code: 'INR', label: 'INR' },
    USD: { symbol: '$', code: 'USD', label: 'USD' },
    EUR: { symbol: '€', code: 'EUR', label: 'EUR' },
};

const COUNTRY_CURRENCY_MAP = {
    IN: 'INR',
    US: 'USD', CA: 'USD', AU: 'USD', NZ: 'USD', SG: 'USD',
    GB: 'EUR', DE: 'EUR', FR: 'EUR', IT: 'EUR', ES: 'EUR',
    NL: 'EUR', BE: 'EUR', AT: 'EUR', PT: 'EUR', IE: 'EUR',
    FI: 'EUR', GR: 'EUR', SE: 'EUR', NO: 'EUR', DK: 'EUR',
    CH: 'EUR', PL: 'EUR',
};

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
    const [currency, setCurrencyState] = useState(() => getStoredCurrency() || 'USD');

    useEffect(() => {
        const stored = getStoredCurrency();
        if (stored) return;

        const controller = new AbortController();
        fetch('http://ip-api.com/json/?fields=countryCode', { signal: controller.signal })
            .then(res => res.json())
            .then(data => {
                if (data.countryCode) {
                    const detected = COUNTRY_CURRENCY_MAP[data.countryCode] || 'USD';
                    setCurrencyState(detected);
                    storeCurrency(detected, false);
                }
            })
            .catch(() => {});

        return () => controller.abort();
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
