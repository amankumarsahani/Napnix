export default function CurrencySwitcher({ currency, setCurrency, currencies }) {
    return (
        <div className="inline-flex items-center gap-1 bg-slate-100 rounded-full p-1">
            {Object.values(currencies).map(({ code, symbol, label }) => (
                <button
                    key={code}
                    onClick={() => setCurrency(code)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        currency === code
                            ? 'bg-white text-slate-900 shadow-sm'
                            : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                    {symbol} {label}
                </button>
            ))}
        </div>
    );
}
