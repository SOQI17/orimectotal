const fs = require('fs');

let file = fs.readFileSync('src/App.tsx', 'utf8').replace(/\r\n/g, '\n');

// 1. Update spConsumos in salespersonPerformance to filter by activeCategory
const oldSpConsumos = `      const spConsumos = allConsumos.filter(r => {
        const c = clientsById.get(r.client_id);
        return (c?.salesperson || '').toUpperCase().trim() === spName;
      });`;

const newSpConsumos = `      const spConsumos = allConsumos.filter(r => {
        const c = clientsById.get(r.client_id);
        const isSp = (c?.salesperson || '').toUpperCase().trim() === spName;
        const isCat = activeCategory === 'ALL' || (r.categoria || 'PELICULAS') === activeCategory;
        return isSp && isCat;
      });`;

if (file.includes(oldSpConsumos)) {
  file = file.replace(oldSpConsumos, newSpConsumos);
  console.log('1. spConsumos activeCategory filter added');
} else {
  console.log('1. spConsumos pattern not found');
}

// 2. Update revenue calculation to use sale_price || unit_cost
const oldRevenue = `const revenue = periodConsumos.reduce((s, r) => s + (effectiveQty(r) * (r.unit_cost || 0)), 0);`;
const newRevenue = `const revenue = periodConsumos.reduce((s, r) => {
        const price = (r.sale_price !== null && r.sale_price !== undefined) ? r.sale_price : (r.unit_cost || 0);
        return s + (effectiveQty(r) * price);
      }, 0);`;

if (file.includes(oldRevenue)) {
  file = file.replace(oldRevenue, newRevenue);
  console.log('2. Revenue calculation updated');
} else {
  console.log('2. Revenue pattern not found');
}

// 3. Update useMemo dependency array for salespersonPerformance
const oldDeps = `}, [salespersonGoals, allConsumos, allClients, clientsById, dashboardStartDate, dashboardEndDate, globalFilmFilter, view]);`;
const newDeps = `}, [salespersonGoals, allConsumos, allClients, clientsById, dashboardStartDate, dashboardEndDate, globalFilmFilter, view, activeCategory]);`;

if (file.includes(oldDeps)) {
  file = file.replace(oldDeps, newDeps);
  console.log('3. Dependency array updated');
} else {
  console.log('3. Dependency array pattern not found');
}

// 4. Update vendor compare chart filtering by activeCategory
const oldCompareFilter = `row[sp] = allConsumos.filter(r => {
                        const d = new Date(r.order_date);
                        return d.getFullYear() === now.getFullYear() && d.getMonth() === mi
                          && (r as any).salesperson_name === sp && !r.is_return;
                      }).reduce((s,r) => s + r.quantity, 0);`;

const newCompareFilter = `row[sp] = allConsumos.filter(r => {
                        const d = new Date(r.order_date);
                        const isCat = activeCategory === 'ALL' || (r.categoria || 'PELICULAS') === activeCategory;
                        const c = clientsById.get(r.client_id);
                        const spName = (c?.salesperson || '').toUpperCase().trim();
                        return d.getFullYear() === now.getFullYear() && d.getMonth() === mi
                          && (spName === sp || (r as any).salesperson_name === sp) && !r.is_return && isCat;
                      }).reduce((s,r) => s + r.quantity, 0);`;

if (file.includes(oldCompareFilter)) {
  file = file.replace(oldCompareFilter, newCompareFilter);
  console.log('4. Vendor compare chart updated');
} else {
  console.log('4. Vendor compare chart pattern not found');
}

// 5. Remove Retornos / Devoluciones section from Intelligence view
const oldRetornosBlock = `            {/* ── RETORNOS ── */}
            {returnsSummary.returns.length > 0 && (
              <div className={cn("rounded-xl border overflow-hidden", darkMode ? "bg-[#16161A] border-white/8" : "bg-white border-gray-200/70 shadow-sm")}>
                <div className={cn("px-6 py-4 border-b flex items-center justify-between flex-wrap gap-3", darkMode ? "border-white/8 bg-white/3" : "border-gray-100 bg-gray-50")}>
                  <h3 className={cn("text-[10px] font-bold uppercase tracking-wider flex items-center gap-2", darkMode ? "text-gray-400" : "text-gray-600")}>
                    <TrendingDown className="w-3.5 h-3.5 text-amber-400" /> Retornos / Devoluciones
                  </h3>
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <p className="text-lg font-black text-amber-400">{returnsSummary.totalUnits}</p>
                      <p className={cn("text-[9px]", darkMode ? "text-gray-600" : "text-gray-400")}>cajas devueltas</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-black text-red-400">\${returnsSummary.totalValue.toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                      <p className={cn("text-[9px]", darkMode ? "text-gray-600" : "text-gray-400")}>valor total devuelto</p>
                    </div>
                  </div>
                </div>
                <div className="overflow-x-auto max-h-72 overflow-y-auto custom-scrollbar">
                  <table className="w-full text-left text-xs">
                    <thead className={cn("text-[9px] font-bold uppercase tracking-wider sticky top-0 z-10", darkMode ? "text-gray-600 bg-[#16161A]" : "text-gray-400 bg-white")}>
                      <tr>
                        <th className="px-5 py-2.5">Fecha</th>
                        <th className="px-5 py-2.5">Cliente</th>
                        <th className="px-5 py-2.5">Vendedor</th>
                        <th className="px-5 py-2.5">Factura</th>
                        <th className="px-5 py-2.5 text-center">Medida</th>
                        <th className="px-5 py-2.5 text-center">Cajas</th>
                        <th className="px-5 py-2.5 text-right">Valor</th>
                        <th className="px-5 py-2.5 text-center">Acción</th>
                      </tr>
                    </thead>
                    <tbody className={cn("divide-y", darkMode ? "divide-white/4" : "divide-gray-50")}>
                      {returnsSummary.returns.map((r, i) => {
                        const client = allClients.find(c => c.id === r.client_id);
                        return (
                          <tr key={i} className={cn("transition-colors", darkMode ? "hover:bg-white/3" : "hover:bg-amber-50/40")}>
                            <td className={cn("px-5 py-3 font-medium", darkMode ? "text-gray-400" : "text-gray-600")}>{r.order_date}</td>
                            <td className="px-5 py-3">
                              <p className="font-semibold truncate max-w-[200px]">{client?.name || '—'}</p>
                              <p className={cn("text-[9px]", darkMode ? "text-gray-600" : "text-gray-400")}>{client?.province || '—'}</p>
                            </td>
                            <td className={cn("px-5 py-3 text-[10px]", darkMode ? "text-gray-500" : "text-gray-400")}>{client?.salesperson || '—'}</td>
                            <td className={cn("px-5 py-3 font-mono text-[10px]", darkMode ? "text-gray-500" : "text-gray-400")}>{r.invoice_number || '—'}</td>
                            <td className="px-5 py-3 text-center">
                              {r.size && <span className={cn("px-1.5 py-0.5 rounded text-[9px] font-black uppercase", darkMode ? "bg-white/10 text-gray-300" : "bg-gray-800 text-white")}>{r.size}</span>}
                            </td>
                            <td className="px-5 py-3 text-center">
                              <span className="font-black text-amber-400">{r.quantity}</span>
                            </td>
                            <td className="px-5 py-3 text-right font-bold text-red-400">
                              \${Math.abs(r.quantity * (r.unit_cost || 0)).toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                            <td className="px-5 py-3 text-center">
                              <button onClick={() => { if (client) { setSelectedClient(client); setView('clients'); } }}
                                className={cn("text-[9px] font-bold px-2.5 py-1 rounded-lg transition-colors inline-flex items-center gap-1",
                                  darkMode ? "bg-white/8 text-gray-400 hover:bg-white/12" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                )}>
                                <ArrowRight className="w-3 h-3" /> Ver
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}`;

if (file.includes(oldRetornosBlock)) {
  file = file.replace(oldRetornosBlock, '');
  console.log('5. Retornos section removed successfully');
} else {
  console.log('5. Retornos section pattern not found');
}

fs.writeFileSync('src/App.tsx', file.replace(/\n/g, '\r\n'), 'utf8');
