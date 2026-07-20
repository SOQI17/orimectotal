const fs = require('fs');

let file = fs.readFileSync('src/App.tsx', 'utf8').replace(/\r\n/g, '\n');

const oldComparativoStart = `{/* ══ TAB: COMPARATIVO ANUAL ══ */}
            {intelligenceTab === 'comparativo' && (() => {`;

const newComparativoStart = `{/* ══ TAB: COMPARATIVO ANUAL ══ */}
            {intelligenceTab === 'comparativo' && (() => {
              if (activeCategory !== 'PELICULAS' && activeCategory !== 'ALL') {
                const YEARS = [2024, 2025, 2026] as const;
                const yearlyMetrics: Record<number, { units: number; revenue: number; items: Record<string, { units: number; revenue: number }> }> = {
                  2024: { units: 0, revenue: 0, items: {} },
                  2025: { units: 0, revenue: 0, items: {} },
                  2026: { units: 0, revenue: 0, items: {} },
                };

                activeCategoryConsumos.forEach(r => {
                  const d = new Date(r.order_date);
                  const y = d.getFullYear();
                  if (![2024, 2025, 2026].includes(y)) return;
                  const qty = effectiveQty(r);
                  const price = (r as any).sale_price !== null && (r as any).sale_price !== undefined ? (r as any).sale_price : (r.unit_cost || 0);
                  const rev = qty * price;
                  const itemKey = r.product_name || r.size || 'Producto Sin Nombre';

                  yearlyMetrics[y].units += qty;
                  yearlyMetrics[y].revenue += rev;
                  if (!yearlyMetrics[y].items[itemKey]) yearlyMetrics[y].items[itemKey] = { units: 0, revenue: 0 };
                  yearlyMetrics[y].items[itemKey].units += qty;
                  yearlyMetrics[y].items[itemKey].revenue += rev;
                });

                const allItems = [...new Set(YEARS.flatMap(y => Object.keys(yearlyMetrics[y].items)))].sort();

                return (
                  <div className="space-y-5">
                    <div className="grid grid-cols-3 gap-4">
                      {YEARS.map(y => {
                        const rev = yearlyMetrics[y].revenue;
                        const units = yearlyMetrics[y].units;
                        const prev = y > 2024 ? yearlyMetrics[y - 1].revenue : null;
                        const growth = prev && prev > 0 ? ((rev - prev) / prev * 100) : null;
                        return (
                          <div key={y} className={cn("rounded-xl border p-5",
                            y === 2024 ? (darkMode ? "bg-gray-500/10 border-gray-500/20" : "bg-gray-50 border-gray-200")
                            : y === 2025 ? (darkMode ? "bg-cyan-500/8 border-cyan-500/20" : "bg-cyan-50 border-cyan-200")
                            : (darkMode ? "bg-emerald-500/8 border-emerald-500/20" : "bg-emerald-50 border-emerald-200")
                          )}>
                            <div className="flex items-center justify-between mb-3">
                              <span className={cn("text-xs font-black", y === 2024 ? "text-gray-400" : y === 2025 ? "text-cyan-400" : "text-emerald-400")}>{y}</span>
                              {growth !== null && (
                                <span className={cn("text-[9px] font-bold", growth >= 0 ? "text-emerald-400" : "text-red-400")}>
                                  {growth >= 0 ? '▲' : '▼'} {Math.abs(growth).toFixed(1)}% vs ant.
                                </span>
                              )}
                            </div>
                            <p className={cn("text-3xl font-black leading-none", y === 2024 ? "text-gray-400" : y === 2025 ? "text-cyan-400" : "text-emerald-400")}>
                              \${rev.toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                            <p className={cn("text-[10px] font-semibold mt-1", darkMode ? "text-gray-500" : "text-gray-400")}>facturación total ({activeCategoryLabel})</p>
                            <p className={cn("text-lg font-black mt-2", darkMode ? "text-white" : "text-gray-800")}>{units.toLocaleString()} unid.</p>
                          </div>
                        );
                      })}
                    </div>

                    <div className={cn("rounded-xl border overflow-hidden", darkMode ? "bg-[#16161A] border-white/8" : "bg-white border-gray-200/70 shadow-sm")}>
                      <div className={cn("px-6 py-3 border-b flex items-center justify-between", darkMode ? "bg-white/3 border-white/8" : "bg-gray-50 border-gray-100")}>
                        <span className={cn("text-[10px] font-bold uppercase tracking-wider", darkMode ? "text-gray-400" : "text-gray-600")}>
                          Comparativo anual de {activeCategoryLabel} por Producto / Descripción
                        </span>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs min-w-[650px]">
                          <thead className={cn("text-[9px] font-bold uppercase tracking-wider", darkMode ? "text-gray-600 bg-white/2" : "text-gray-400 bg-gray-50/60")}>
                            <tr>
                              <th className="px-5 py-2.5 text-left">Producto / Descripción</th>
                              <th className="px-4 py-2.5 text-right">2024 ($)</th>
                              <th className="px-4 py-2.5 text-right">2025 ($)</th>
                              <th className="px-4 py-2.5 text-right">2026 ($)</th>
                              <th className="px-4 py-2.5 text-center">Crecimiento (25→26)</th>
                            </tr>
                          </thead>
                          <tbody className={cn("divide-y", darkMode ? "divide-white/5" : "divide-gray-50")}>
                            {allItems.map(item => {
                              const r24 = yearlyMetrics[2024].items[item]?.revenue || 0;
                              const r25 = yearlyMetrics[2025].items[item]?.revenue || 0;
                              const r26 = yearlyMetrics[2026].items[item]?.revenue || 0;
                              const g2526 = r25 > 0 ? ((r26 - r25) / r25 * 100) : null;

                              return (
                                <tr key={item} className={cn("transition-colors", darkMode ? "hover:bg-white/3" : "hover:bg-gray-50/50")}>
                                  <td className="px-5 py-3 font-semibold">{item}</td>
                                  <td className="px-4 py-3 text-right font-mono">{r24 > 0 ? \`\$\${r24.toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\` : '—'}</td>
                                  <td className="px-4 py-3 text-right font-mono text-cyan-400">{r25 > 0 ? \`\$\${r25.toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\` : '—'}</td>
                                  <td className="px-4 py-3 text-right font-mono text-emerald-400 font-bold">{r26 > 0 ? \`\$\${r26.toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\` : '—'}</td>
                                  <td className="px-4 py-3 text-center">
                                    {g2526 !== null ? (
                                      <span className={cn("text-[9px] font-bold", g2526 >= 0 ? "text-emerald-400" : "text-red-400")}>
                                        {g2526 >= 0 ? '▲' : '▼'}{Math.abs(g2526).toFixed(0)}%
                                      </span>
                                    ) : '—'}
                                  </td>
                                </tr>
                              );
                            })}
                            {allItems.length === 0 && (
                              <tr>
                                <td colSpan={5} className="px-5 py-8 text-center text-gray-500">
                                  No hay datos registrados para esta línea de negocio
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                );
              }`;

if (file.includes(oldComparativoStart)) {
  file = file.replace(oldComparativoStart, newComparativoStart);
  console.log('Comparativo tab for non-films inserted successfully');
} else {
  console.log('Comparativo tab start pattern not found');
}

fs.writeFileSync('src/App.tsx', file.replace(/\n/g, '\r\n'), 'utf8');
