/**
 * Shared article building blocks: a direct-answer block, a comparison table and
 * an inline bar chart.
 *
 * All three exist for the same reason. AI answer engines quote passages they can
 * lift without surrounding context, and they lean on tables and figures for
 * comparative claims; roughly the first third of a page supplies most citations,
 * so the quotable form has to appear early rather than in a conclusion. These
 * posts previously buried their answers in prose, carried one table between
 * them, and used no ordered lists or figures at all.
 *
 * The chart is inline SVG rather than an image: it stays crisp, needs no
 * request, and — because it is real markup — its numbers are readable by
 * anything parsing the page, which a PNG's would not be.
 */

/**
 * A self-contained answer to one question, placed directly under the heading it
 * answers. Keep the body to roughly 40-70 words and make it stand on its own:
 * no "as described above", no pronoun whose referent is in another paragraph.
 */
export function AnswerBlock({ question, children }) {
    return (
        <aside className="not-prose my-8 rounded-2xl border border-blue-200 bg-blue-50/70 p-6">
            <p className="text-sm font-bold uppercase tracking-wide text-blue-700 mb-2">
                {question}
            </p>
            <div className="text-lg leading-relaxed text-slate-800 [&>p]:m-0 [&>p+p]:mt-3">
                {children}
            </div>
        </aside>
    );
}

/**
 * A comparison table with a real caption and scoped headers.
 *
 * @param {{ caption: string, columns: string[], rows: (string|number)[][], firstColumnHeader?: boolean }} props
 */
export function DataTable({ caption, columns, rows, firstColumnHeader = true }) {
    return (
        <figure className="not-prose my-8 overflow-x-auto">
            <table className="min-w-full text-sm border-collapse">
                <caption className="text-left text-sm text-slate-500 mb-3 caption-top">
                    {caption}
                </caption>
                <thead>
                    <tr className="bg-slate-100 border-b border-slate-300 text-left">
                        {columns.map((col) => (
                            <th key={col} scope="col" className="py-3 px-4 font-bold text-slate-800">
                                {col}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, i) => (
                        <tr key={row[0] ?? i} className="border-b border-slate-200 last:border-0 align-top">
                            {row.map((cell, j) =>
                                j === 0 && firstColumnHeader ? (
                                    <th key={j} scope="row" className="py-3 px-4 font-semibold text-slate-800 text-left">
                                        {cell}
                                    </th>
                                ) : (
                                    <td key={j} className="py-3 px-4 text-slate-700">{cell}</td>
                                ),
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </figure>
    );
}

/**
 * Horizontal bar chart as inline SVG, with the figures printed on the bars so
 * the values survive for a reader who cannot see it and for anything parsing
 * the markup. A caption carries the unit and the source.
 *
 * @param {{ caption: string, unit?: string, data: { label: string, value: number, display?: string }[] }} props
 */
export function BarChart({ caption, unit = '', data }) {
    const max = Math.max(...data.map((d) => d.value));
    const ROW_H = 44;
    const BAR_H = 22;
    const LABEL_W = 150;
    const TRACK_W = 320;
    const height = data.length * ROW_H + 8;
    const width = LABEL_W + TRACK_W + 70;

    return (
        <figure className="not-prose my-8">
            <svg
                viewBox={`0 0 ${width} ${height}`}
                className="w-full h-auto max-w-2xl"
                role="img"
                aria-label={caption}
            >
                {data.map((d, i) => {
                    const y = i * ROW_H + 10;
                    const w = max > 0 ? Math.max(2, (d.value / max) * TRACK_W) : 2;
                    return (
                        <g key={d.label}>
                            <text
                                x={LABEL_W - 10}
                                y={y + BAR_H / 2 + 1}
                                textAnchor="end"
                                dominantBaseline="middle"
                                className="fill-slate-700"
                                style={{ fontSize: 13, fontWeight: 600 }}
                            >
                                {d.label}
                            </text>
                            <rect x={LABEL_W} y={y} width={TRACK_W} height={BAR_H} rx={4} className="fill-slate-100" />
                            <rect x={LABEL_W} y={y} width={w} height={BAR_H} rx={4} className="fill-blue-600" />
                            <text
                                x={LABEL_W + w + 8}
                                y={y + BAR_H / 2 + 1}
                                dominantBaseline="middle"
                                className="fill-slate-600"
                                style={{ fontSize: 12 }}
                            >
                                {d.display ?? `${d.value}${unit}`}
                            </text>
                        </g>
                    );
                })}
            </svg>
            <figcaption className="text-sm text-slate-500 mt-2">{caption}</figcaption>
        </figure>
    );
}
