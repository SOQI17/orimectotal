const fs = require('fs');

let file = fs.readFileSync('src/App.tsx', 'utf8').replace(/\r\n/g, '\n');

// 1. Update topClients mapping to include client id
const oldTopClientsMap = `        const topClients = Object.entries(clientDist)
          .map(([id, v]) => ({ name: allClients.find(c => c.id === parseInt(id))?.name || '?', qty: v.qty, m2: v.m2, revenue: v.revenue }))
          .sort((a, b) => isFilm ? b.m2 - a.m2 : b.revenue - a.revenue).slice(0, 8);`;

const newTopClientsMap = `        const topClients = Object.entries(clientDist)
          .map(([id, v]) => ({ id: parseInt(id), name: allClients.find(c => c.id === parseInt(id))?.name || '?', qty: v.qty, m2: v.m2, revenue: v.revenue }))
          .sort((a, b) => isFilm ? b.m2 - a.m2 : b.revenue - a.revenue).slice(0, 8);`;

if (file.includes(oldTopClientsMap)) {
  file = file.replace(oldTopClientsMap, newTopClientsMap);
  console.log('1. topClients mapping updated with id');
} else {
  console.log('1. topClients mapping pattern not found');
}

// 2. Update Top Clients JSX block to be clickable with hover effects and navigation
const oldTopClientsJSX = `                  {/* Top Clients */}
                  <div className={cn("col-span-6 rounded-xl p-5 border", darkMode ? "bg-white/3 border-white/6" : "bg-gray-50 border-gray-100")}>
                    <p className={cn("text-[10px] font-bold uppercase tracking-wider mb-4", darkMode ? "text-gray-500" : "text-gray-400")}>
                      {isFilm ? 'Top clientes por m²' : 'Top clientes por ventas ($)'}
                    </p>
                    <div className="space-y-2.5">
                      {topClients.map((c, i) => (
                        <div key={i}>
                          <div className="flex items-center justify-between mb-1">
                            <span className={cn("text-xs font-semibold truncate max-w-[180px]", darkMode ? "text-gray-300" : "text-gray-700")}>{c.name}</span>
                            <div className="flex items-baseline gap-1.5 ml-2 shrink-0">
                              {isFilm ? (
                                <>
                                  <span className={cn("text-sm font-black", darkMode ? "text-cyan-400" : "text-cyan-600")}>{c.m2.toLocaleString('es-EC', { maximumFractionDigits: 1 })} m²</span>
                                  <span className={cn("text-[9px] font-semibold", darkMode ? "text-gray-600" : "text-gray-400")}>{c.qty} cj</span>
                                </>
                              ) : (
                                <>
                                  <span className="text-sm font-black text-emerald-400">\${c.revenue.toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                  <span className={cn("text-[9px] font-semibold", darkMode ? "text-gray-600" : "text-gray-400")}>{c.qty} unid.</span>
                                </>
                              )}
                            </div>
                          </div>
                          <div className={cn("h-1.5 rounded-full overflow-hidden", darkMode ? "bg-white/6" : "bg-gray-200")}>
                            <div className="h-full rounded-full bg-[#ED1C24] transition-all" style={{ width: \`\${((isFilm ? c.m2 : c.revenue) / maxMetricTc) * 100}%\` }} />
                          </div>
                        </div>
                      ))}
                      {topClients.length === 0 && <p className={cn("text-xs", darkMode ? "text-gray-600" : "text-gray-400")}>Sin datos</p>}
                    </div>
                  </div>`;

const newTopClientsJSX = `                  {/* Top Clients */}
                  <div className={cn("col-span-6 rounded-xl p-5 border", darkMode ? "bg-white/3 border-white/6" : "bg-gray-50 border-gray-100")}>
                    <p className={cn("text-[10px] font-bold uppercase tracking-wider mb-4 flex items-center justify-between", darkMode ? "text-gray-500" : "text-gray-400")}>
                      <span>{isFilm ? 'Top clientes por m²' : 'Top clientes por ventas ($)'}</span>
                      <span className="text-[9px] font-normal normal-case text-cyan-400 flex items-center gap-1">(Haz clic para ir al cliente)</span>
                    </p>
                    <div className="space-y-2.5">
                      {topClients.map((c, i) => (
                        <div
                          key={i}
                          onClick={() => {
                            const clientObj = allClients.find(cl => cl.id === c.id);
                            if (clientObj) {
                              setSelectedClient(clientObj);
                              setView('clients');
                              setSelectedSalesperson(null);
                            }
                          }}
                          className={cn("p-1.5 -mx-1.5 rounded-lg transition-all cursor-pointer group flex flex-col justify-center",
                            darkMode ? "hover:bg-white/6" : "hover:bg-gray-200/70"
                          )}
                          title="Haz clic para ver el detalle de este cliente"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className={cn("text-xs font-semibold truncate max-w-[180px] group-hover:text-cyan-400 transition-colors flex items-center gap-1", darkMode ? "text-gray-300" : "text-gray-700")}>
                              {c.name}
                              <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-cyan-400 shrink-0" />
                            </span>
                            <div className="flex items-baseline gap-1.5 ml-2 shrink-0">
                              {isFilm ? (
                                <>
                                  <span className={cn("text-sm font-black", darkMode ? "text-cyan-400" : "text-cyan-600")}>{c.m2.toLocaleString('es-EC', { maximumFractionDigits: 1 })} m²</span>
                                  <span className={cn("text-[9px] font-semibold", darkMode ? "text-gray-600" : "text-gray-400")}>{c.qty} cj</span>
                                </>
                              ) : (
                                <>
                                  <span className="text-sm font-black text-emerald-400">\${c.revenue.toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                  <span className={cn("text-[9px] font-semibold", darkMode ? "text-gray-600" : "text-gray-400")}>{c.qty} unid.</span>
                                </>
                              )}
                            </div>
                          </div>
                          <div className={cn("h-1.5 rounded-full overflow-hidden", darkMode ? "bg-white/6" : "bg-gray-200")}>
                            <div className="h-full rounded-full bg-[#ED1C24] transition-all" style={{ width: \`\${((isFilm ? c.m2 : c.revenue) / maxMetricTc) * 100}%\` }} />
                          </div>
                        </div>
                      ))}
                      {topClients.length === 0 && <p className={cn("text-xs", darkMode ? "text-gray-600" : "text-gray-400")}>Sin datos</p>}
                    </div>
                  </div>`;

if (file.includes(oldTopClientsJSX)) {
  file = file.replace(oldTopClientsJSX, newTopTopClientsJSX = newTopClientsJSX);
  console.log('2. Top clients clickable navigation added');
} else {
  console.log('2. Top clients pattern not found');
}

fs.writeFileSync('src/App.tsx', file.replace(/\n/g, '\r\n'), 'utf8');
