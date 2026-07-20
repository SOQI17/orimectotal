const fs = require('fs');

let file = fs.readFileSync('src/App.tsx', 'utf8').replace(/\r\n/g, '\n');

// 1. Update filteredConsumosForView to base on activeCategoryConsumos
const oldFilteredView = `  const filteredConsumosForView = useMemo(() => {
    if (globalFilmFilter === 'all') return allConsumos;
    if (globalFilmFilter === 'DIHT') return allConsumos.filter(r => !r.film_type || r.film_type === 'DIHT');
    if (globalFilmFilter === 'DIML') return allConsumos.filter(r => r.film_type === 'DIML');
    return allConsumos.filter(r => r.film_type === 'DIHL');
  }, [allConsumos, globalFilmFilter]);`;

const newFilteredView = `  const filteredConsumosForView = useMemo(() => {
    let list = activeCategoryConsumos;
    if (globalFilmFilter === 'DIHT') return list.filter(r => !r.film_type || r.film_type === 'DIHT');
    if (globalFilmFilter === 'DIML') return list.filter(r => r.film_type === 'DIML');
    if (globalFilmFilter === 'DIHL') return list.filter(r => r.film_type === 'DIHL');
    return list;
  }, [activeCategoryConsumos, globalFilmFilter]);`;

if (file.includes(oldFilteredView)) {
  file = file.replace(oldFilteredView, newFilteredView);
  console.log('1. filteredConsumosForView updated to use activeCategoryConsumos');
} else {
  console.log('1. filteredConsumosForView pattern not found');
}

// 2. Update Intelligence Header Film Filter to show activeCategory badge for non-films
const oldIntelHeaderFilter = `                {/* Film type filter — hide only on comparativo (shows all data fixed) */}
                {intelligenceTab !== 'comparativo' && (
                <div className={cn("flex items-center gap-1 p-1 rounded-xl", darkMode ? "bg-white/5" : "bg-gray-100")}>
                  {(intelligenceTab === 'projection'
                    ? [['DIHT','DI-HT'], ['DIHL','DI-HL'], ['DIML','DI-ML']] as const
                    : [['all','Todos'], ['DIHT','DI-HT'], ['DIHL','DI-HL'], ['DIML','DI-ML']] as const
                  ).map(([val, label]) => (
                    <button key={val} onClick={() => setGlobalFilmFilter(val as any)}
                      className={cn("px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all",
                        globalFilmFilter === val
                          ? val === 'DIHL' ? "bg-blue-500/20 text-blue-400 ring-1 ring-blue-500/30"
                          : val === 'DIHT' ? "bg-[#ED1C24]/15 text-[#ED1C24] ring-1 ring-[#ED1C24]/30"
                          : val === 'DIML' ? "bg-purple-500/20 text-purple-400 ring-1 ring-purple-500/30"
                          : (darkMode ? "bg-white/12 text-white" : "bg-gray-800 text-white")
                          : (darkMode ? "text-gray-600 hover:text-gray-400 hover:bg-white/5" : "text-gray-400 hover:text-gray-600 hover:bg-gray-200")
                      )}>{label}</button>
                  ))}
                </div>
                )}`;

const newIntelHeaderFilter = `                {/* Film type filter for PELICULAS or Active Line Badge for non-films */}
                {activeCategory === 'PELICULAS' ? (
                  intelligenceTab !== 'comparativo' && (
                    <div className={cn("flex items-center gap-1 p-1 rounded-xl", darkMode ? "bg-white/5" : "bg-gray-100")}>
                      {(intelligenceTab === 'projection'
                        ? [['DIHT','DI-HT'], ['DIHL','DI-HL'], ['DIML','DI-ML']] as const
                        : [['all','Todos'], ['DIHT','DI-HT'], ['DIHL','DI-HL'], ['DIML','DI-ML']] as const
                      ).map(([val, label]) => (
                        <button key={val} onClick={() => setGlobalFilmFilter(val as any)}
                          className={cn("px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all",
                            globalFilmFilter === val
                              ? val === 'DIHL' ? "bg-blue-500/20 text-blue-400 ring-1 ring-blue-500/30"
                              : val === 'DIHT' ? "bg-[#ED1C24]/15 text-[#ED1C24] ring-1 ring-[#ED1C24]/30"
                              : val === 'DIML' ? "bg-purple-500/20 text-purple-400 ring-1 ring-purple-500/30"
                              : (darkMode ? "bg-white/12 text-white" : "bg-gray-800 text-white")
                              : (darkMode ? "text-gray-600 hover:text-gray-400 hover:bg-white/5" : "text-gray-400 hover:text-gray-600 hover:bg-gray-200")
                          )}>{label}</button>
                      ))}
                    </div>
                  )
                ) : (
                  <div className={cn("px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider border", darkMode ? "bg-white/8 border-white/10 text-cyan-400" : "bg-gray-100 border-gray-200 text-gray-800")}>
                    Línea: {activeCategoryLabel}
                  </div>
                )}`;

if (file.includes(oldIntelHeaderFilter)) {
  file = file.replace(oldIntelHeaderFilter, newIntelHeaderFilter);
  console.log('2. Intelligence Header filter updated for activeCategory');
} else {
  console.log('2. Intelligence Header filter pattern not found');
}

// 3. Update Health Tab Table Headers & Cells for non-films
const oldHealthHeader = `<th className="px-5 py-2.5 text-center">m²/mes</th>`;
const newHealthHeader = `<th className="px-5 py-2.5 text-center">{activeCategory === 'PELICULAS' ? 'm²/mes' : 'Facturado ($)'}</th>`;

if (file.includes(oldHealthHeader)) {
  file = file.replace(oldHealthHeader, newHealthHeader);
  console.log('3. Health Tab header updated');
} else {
  console.log('3. Health Tab header pattern not found');
}

const oldHealthCell = `<span className={cn("font-black text-sm", darkMode ? "text-cyan-400" : "text-cyan-600")}>
                                {getTotalM2(item.avgMonthly,
                                  filteredConsumosForView.filter((r: ConsumptionRecord) => r.client_id === item.client.id)
                                    .reduce((best: string, _r: ConsumptionRecord, _i: number, arr: ConsumptionRecord[]) => {
                                      const sd: Record<string,number> = {};
                                      arr.forEach((r: ConsumptionRecord) => { sd[r.size]=(sd[r.size]||0)+r.quantity; });
                                      return Object.entries(sd).sort((a,b)=>b[1]-a[1])[0]?.[0] || '14x17';
                                    }, '14x17'),
                                  globalFilmFilter === 'DIHL' ? 'DIHL' : 'DIHT').toFixed(2)}
                              </span>
                              <span className={cn("text-[9px] block", darkMode ? "text-gray-600" : "text-gray-400")}>m²</span>`;

const newHealthCell = `<span className={cn("font-black text-sm", activeCategory === 'PELICULAS' ? (darkMode ? "text-cyan-400" : "text-cyan-600") : "text-emerald-400")}>
                                {activeCategory === 'PELICULAS' ? (
                                  getTotalM2(item.avgMonthly,
                                    filteredConsumosForView.filter((r: ConsumptionRecord) => r.client_id === item.client.id)
                                      .reduce((best: string, _r: ConsumptionRecord, _i: number, arr: ConsumptionRecord[]) => {
                                        const sd: Record<string,number> = {};
                                        arr.forEach((r: ConsumptionRecord) => { sd[r.size]=(sd[r.size]||0)+r.quantity; });
                                        return Object.entries(sd).sort((a,b)=>b[1]-a[1])[0]?.[0] || '14x17';
                                      }, '14x17'),
                                    globalFilmFilter === 'DIHL' ? 'DIHL' : 'DIHT').toFixed(2)
                                ) : (
                                  \`$\${(item.monthlyRevenue || 0).toLocaleString('es-EC', { maximumFractionDigits: 0 })}\`
                                )}
                              </span>
                              <span className={cn("text-[9px] block", darkMode ? "text-gray-600" : "text-gray-400")}>{activeCategory === 'PELICULAS' ? 'm²' : 'total'}</span>`;

if (file.includes(oldHealthCell)) {
  file = file.replace(oldHealthCell, newHealthCell);
  console.log('4. Health Tab cell updated');
} else {
  console.log('4. Health Tab cell pattern not found');
}

// 4. Update Profitability Tab Header & Sorting for non-films
const oldProfitHeader = `<h3 className={cn("text-[10px] font-bold uppercase tracking-wider flex items-center gap-2", darkMode ? "text-gray-400" : "text-gray-600")}>
                    Ranking por Superficie — m² consumidos por cliente (orden descendente)
                  </h3>`;

const newProfitHeader = `<h3 className={cn("text-[10px] font-bold uppercase tracking-wider flex items-center gap-2", darkMode ? "text-gray-400" : "text-gray-600")}>
                    {activeCategory === 'PELICULAS' ? 'Ranking por Superficie — m² consumidos por cliente (orden descendente)' : 'Ranking por Facturación Total — Ingresos generados por cliente (orden descendente)'}
                  </h3>`;

if (file.includes(oldProfitHeader)) {
  file = file.replace(oldProfitHeader, newProfitHeader);
  console.log('5. Profitability Header updated');
} else {
  console.log('5. Profitability Header pattern not found');
}

// Update profitabilityRanking sort order based on activeCategory
const oldProfitSort = `}).filter(Boolean).sort((a,b) => b!.totalM2client - a!.totalM2client) as any[];`;
const newProfitSort = `}).filter(Boolean).sort((a,b) => (activeCategory === 'PELICULAS' || activeCategory === 'ALL' ? (b!.totalM2client - a!.totalM2client) : (b!.totalCost - a!.totalCost))) as any[];`;

if (file.includes(oldProfitSort)) {
  file = file.replace(oldProfitSort, newProfitSort);
  console.log('6. Profitability Sorting updated');
} else {
  console.log('6. Profitability Sorting pattern not found');
}

fs.writeFileSync('src/App.tsx', file.replace(/\n/g, '\r\n'), 'utf8');
