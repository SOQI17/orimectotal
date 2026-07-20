const fs = require('fs');

let file = fs.readFileSync('src/App.tsx', 'utf8').replace(/\r\n/g, '\n');

const oldModalStart = `      {/* Salesperson Detail Modal */}
      {selectedSalesperson && (() => {
        const spName = selectedSalesperson;
        // All consumos for this salesperson
        const spConsumos = allConsumos.filter(r => {
          const c = allClients.find(x => x.id === r.client_id);
          return (c?.salesperson || '').toUpperCase().trim() === spName;
        });`;

const newModalStart = `      {/* Salesperson Detail Modal */}
      {selectedSalesperson && (() => {
        const spName = selectedSalesperson;
        const isFilm = activeCategory === 'PELICULAS' || activeCategory === 'ALL';

        // Consumos for this salesperson in the active business line
        const spConsumos = activeCategoryConsumos.filter(r => {
          const c = allClients.find(x => x.id === r.client_id);
          return (c?.salesperson || '').toUpperCase().trim() === spName;
        });`;

if (file.includes(oldModalStart)) {
  file = file.replace(oldModalStart, newModalStart);
  console.log('Salesperson modal filtered by activeCategoryConsumos');
} else {
  console.log('Salesperson modal start pattern not found');
}

// Replace the entire modal JSX content
const oldModalFullBlock = `        // Total metrics
        const totalCajas = spConsumos.reduce((s, r) => s + effectiveQty(r), 0);
        const totalRevenue = spConsumos.reduce((s, r) => s + r.quantity * (r.unit_cost || 0), 0);
        const totalClients = spClients.length;
        const totalM2sp = parseFloat(spConsumos.reduce((s, r) => s + getTotalM2(effectiveQty(r), r.size, r.film_type), 0).toFixed(1));

        // Monthly trend (last 12 months)
        const now = new Date();
        const monthlyData = Array.from({ length: 12 }, (_, i) => {
          const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
          const label = d.toLocaleDateString('es-EC', { month: 'short', year: '2-digit' });
          const monthConsumos = spConsumos.filter(r => {
            const rd = new Date(r.order_date);
            return rd.getFullYear() === d.getFullYear() && rd.getMonth() === d.getMonth();
          });
          const cajas = monthConsumos.reduce((s, r) => s + effectiveQty(r), 0);
          const m2 = parseFloat(monthConsumos.reduce((s, r) => s + getTotalM2(effectiveQty(r), r.size, r.film_type), 0).toFixed(1));
          const revenue = monthConsumos.reduce((s, r) => s + r.quantity * (r.unit_cost || 0), 0);
          return { label, cajas, m2, revenue };
        });

        // Top clients
        const clientDist = {} as Record<number, { qty: number; m2: number }>;
        spConsumos.forEach(r => {
          if (!clientDist[r.client_id]) clientDist[r.client_id] = { qty: 0, m2: 0 };
          clientDist[r.client_id].qty += effectiveQty(r);
          clientDist[r.client_id].m2 = parseFloat((clientDist[r.client_id].m2 + getTotalM2(effectiveQty(r), r.size, r.film_type)).toFixed(1));
        });
        const topClients = Object.entries(clientDist)
          .map(([id, v]) => ({ name: allClients.find(c => c.id === parseInt(id))?.name || '?', qty: v.qty, m2: v.m2 }))
          .sort((a, b) => b.m2 - a.m2).slice(0, 8);
        const maxM2tc = topClients[0]?.m2 || 1;

        // Size distribution
        const sizeDist = {} as Record<string, number>;
        spConsumos.forEach(r => { sizeDist[r.size || 'N/A'] = (sizeDist[r.size || 'N/A'] || 0) + r.quantity; });
        const sizeData = Object.entries(sizeDist).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

        // Province distribution
        const provDist = {} as Record<string, number>;
        spConsumos.forEach(r => {
          const prov = allClients.find(c => c.id === r.client_id)?.province || 'Otra';
          provDist[prov] = (provDist[prov] || 0) + r.quantity;
        });
        const provData = Object.entries(provDist).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 6);

        // Best month
        const bestMonth = [...monthlyData].sort((a, b) => b.cajas - a.cajas)[0];
        // Avg monthly
        const activeMonths = monthlyData.filter(m => m.cajas > 0).length || 1;
        const avgMonthly = (totalCajas / activeMonths).toFixed(1);

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setSelectedSalesperson(null)}>
            <div
              onClick={e => e.stopPropagation()}
              className={cn(
                "rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl custom-scrollbar",
                darkMode ? "bg-[#0F0F11] border border-white/10" : "bg-white border border-gray-200"
              )}
            >
              {/* Header */}
              <div className={cn("px-7 py-5 border-b flex items-center justify-between sticky top-0 z-10", darkMode ? "bg-[#0F0F11] border-white/8" : "bg-white border-gray-100")}>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#ED1C24] flex items-center justify-center font-black text-white text-lg">
                    {spName.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-xl font-black leading-none">{spName}</h2>
                    <p className={cn("text-xs mt-1 font-medium", darkMode ? "text-gray-500" : "text-gray-400")}>Estadísticas del vendedor · todos los períodos</p>
                  </div>
                </div>
                <button onClick={() => setSelectedSalesperson(null)} className={cn("p-2 rounded-xl transition-colors", darkMode ? "hover:bg-white/10 text-gray-500" : "hover:bg-gray-100 text-gray-400")}>
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-7 space-y-7">
                {/* KPI Cards */}
                <div className="grid grid-cols-4 gap-4">
                  {[
                    { label: 'Total Cajas', value: totalCajas.toLocaleString(), sub: 'vendidas', color: darkMode ? 'text-white' : 'text-gray-800' },
                    { label: 'Total m²', value: totalM2sp.toLocaleString('es-EC', { maximumFractionDigits: 1 }), sub: 'metros cuadrados', color: darkMode ? 'text-cyan-400' : 'text-cyan-600' },
                    { label: 'Ingresos Totales', value: \`$\${totalRevenue.toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\`, sub: 'generados', color: 'text-[#ED1C24]' },
                    { label: 'Clientes Activos', value: totalClients.toString(), sub: 'centros médicos', color: darkMode ? 'text-white' : 'text-gray-800' },
                    { label: 'Promedio Mensual', value: \`\${avgMonthly}\`, sub: 'cajas / mes', color: darkMode ? 'text-white' : 'text-gray-800' },
                  ].map((kpi, i) => (
                    <div key={i} className={cn("rounded-xl p-4 border", darkMode ? "bg-white/4 border-white/6" : "bg-gray-50 border-gray-100")}>
                      <p className={cn("text-[9px] font-bold uppercase tracking-wider mb-2", darkMode ? "text-gray-600" : "text-gray-400")}>{kpi.label}</p>
                      <p className={cn("text-2xl font-black leading-none", kpi.color)}>{kpi.value}</p>
                      <p className={cn("text-[10px] mt-1", darkMode ? "text-gray-600" : "text-gray-400")}>{kpi.sub}</p>
                    </div>
                  ))}
                </div>

                {/* Monthly trend chart */}
                <div className={cn("rounded-xl p-5 border", darkMode ? "bg-white/3 border-white/6" : "bg-gray-50 border-gray-100")}>
                  <div className="flex items-center justify-between mb-4">
                    <p className={cn("text-[10px] font-bold uppercase tracking-wider", darkMode ? "text-gray-500" : "text-gray-400")}>Evolución mensual — últimos 12 meses</p>
                    {bestMonth.cajas > 0 && (
                      <span className={cn("text-[10px] font-semibold px-2.5 py-1 rounded-lg", darkMode ? "bg-emerald-500/15 text-emerald-400" : "bg-emerald-50 text-emerald-600")}>
                        Mejor mes: {bestMonth.label} · {bestMonth.cajas} cajas · {bestMonth.m2} m²
                      </span>
                    )}
                  </div>
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={monthlyData} barSize={20}>
                      <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.05)'} vertical={false} />
                      <XAxis dataKey="label" tick={{ fontSize: 9, fill: darkMode ? '#555' : '#aaa' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 9, fill: darkMode ? '#555' : '#aaa' }} axisLine={false} tickLine={false} width={28} />
                      <Tooltip
                        contentStyle={{ background: darkMode ? '#1a1a1e' : '#fff', border: \`1px solid \${darkMode ? 'rgba(255,255,255,0.08)' : '#eee'}\`, borderRadius: 10, fontSize: 11 }}
                        content={({ active, payload, label }) => {
                          if (!active || !payload?.length) return null;
                          const d = payload[0].payload;
                          return (
                            <div style={{ background: darkMode ? '#1a1a1e' : '#fff', border: \`1px solid \${darkMode ? 'rgba(255,255,255,0.08)' : '#eee'}\`, borderRadius: 10, padding: '8px 12px', fontSize: 11 }}>
                              <p style={{ fontWeight: 700, color: darkMode ? '#aaa' : '#666', marginBottom: 4 }}>{label}</p>
                              <p style={{ color: '#ED1C24', fontWeight: 800 }}>{d.cajas} cajas</p>
                              <p style={{ color: darkMode ? '#22d3ee' : '#0891b2', fontWeight: 600 }}>{d.m2} m²</p>
                            </div>
                          );
                        }}
                        cursor={{ fill: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)' }}
                      />
                      <Bar dataKey="cajas" fill="#ED1C24" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Bottom: Top Clients + Size dist + Province */}
                <div className="grid grid-cols-12 gap-5">
                  {/* Top Clients */}
                  <div className={cn("col-span-6 rounded-xl p-5 border", darkMode ? "bg-white/3 border-white/6" : "bg-gray-50 border-gray-100")}>
                    <p className={cn("text-[10px] font-bold uppercase tracking-wider mb-4", darkMode ? "text-gray-500" : "text-gray-400")}>Top clientes por m²</p>
                    <div className="space-y-2.5">
                      {topClients.map((c, i) => (
                        <div key={i}>
                          <div className="flex items-center justify-between mb-1">
                            <span className={cn("text-xs font-semibold truncate max-w-[180px]", darkMode ? "text-gray-300" : "text-gray-700")}>{c.name}</span>
                            <div className="flex items-baseline gap-1.5 ml-2 shrink-0">
                              <span className={cn("text-sm font-black", darkMode ? "text-cyan-400" : "text-cyan-600")}>{c.m2.toLocaleString('es-EC', { maximumFractionDigits: 1 })} m²</span>
                              <span className={cn("text-[9px] font-semibold", darkMode ? "text-gray-600" : "text-gray-400")}>{c.qty} cj</span>
                            </div>
                          </div>
                          <div className={cn("h-1.5 rounded-full overflow-hidden", darkMode ? "bg-white/6" : "bg-gray-200")}>
                            <div className="h-full rounded-full bg-[#ED1C24] transition-all" style={{ width: \`\${(c.m2 / maxM2tc) * 100}%\` }} />
                          </div>
                        </div>
                      ))}
                      {topClients.length === 0 && <p className={cn("text-xs", darkMode ? "text-gray-600" : "text-gray-400")}>Sin datos</p>}
                    </div>
                  </div>

                  {/* Size + Province */}
                  <div className="col-span-6 space-y-4">
                    {/* Size distribution */}
                    <div className={cn("rounded-xl p-5 border", darkMode ? "bg-white/3 border-white/6" : "bg-gray-50 border-gray-100")}>
                      <p className={cn("text-[10px] font-bold uppercase tracking-wider mb-3", darkMode ? "text-gray-500" : "text-gray-400")}>Distribución por medida</p>
                      <div className="space-y-2">
                        {sizeData.map((s, i) => {
                          const m2 = parseFloat(spConsumos.filter(r => r.size === s.name).reduce((acc, r) => acc + getTotalM2(effectiveQty(r), r.size, r.film_type), 0).toFixed(1));
                          return (
                          <div key={i} className="flex items-center gap-3">
                            <span className={cn("text-[10px] font-black uppercase px-1.5 py-0.5 rounded w-12 text-center shrink-0", darkMode ? "bg-white/10 text-gray-300" : "bg-gray-200 text-gray-700")}>{s.name || 'N/A'}</span>
                            <div className={cn("flex-1 h-2 rounded-full overflow-hidden", darkMode ? "bg-white/6" : "bg-gray-200")}>
                              <div className="h-full rounded-full bg-[#ED1C24]/70" style={{ width: \`\${(s.value / (sizeData[0]?.value || 1)) * 100}%\` }} />
                            </div>
                            <span className={cn("text-xs font-black w-20 text-right shrink-0", darkMode ? "text-gray-300" : "text-gray-700")}>
                              {s.value} <span className={cn("text-[9px] font-normal", darkMode ? "text-cyan-500" : "text-cyan-600")}>{m2} m²</span>
                            </span>
                          </div>
                          );
                        })}
                      </div>
                    </div>
                    {/* Province distribution */}
                    <div className={cn("rounded-xl p-5 border", darkMode ? "bg-white/3 border-white/6" : "bg-gray-50 border-gray-100")}>
                      <p className={cn("text-[10px] font-bold uppercase tracking-wider mb-3", darkMode ? "text-gray-500" : "text-gray-400")}>Distribución por provincia</p>
                      <div className="space-y-2">
                        {provData.map((p, i) => (
                          <div key={i} className="flex items-center gap-3">
                            <span className={cn("text-[10px] font-semibold capitalize truncate w-24 shrink-0", darkMode ? "text-gray-400" : "text-gray-600")}>{p.name}</span>
                            <div className={cn("flex-1 h-2 rounded-full overflow-hidden", darkMode ? "bg-white/6" : "bg-gray-200")}>
                              <div className="h-full rounded-full bg-blue-500/70" style={{ width: \`\${(p.value / (provData[0]?.value || 1)) * 100}%\` }} />
                            </div>
                            <span className={cn("text-xs font-black w-8 text-right shrink-0", darkMode ? "text-gray-300" : "text-gray-700")}>{p.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );`;

const newModalFullBlock = `        // Total metrics
        const totalUnits = spConsumos.reduce((s, r) => s + effectiveQty(r), 0);
        const totalRevenue = spConsumos.reduce((s, r) => s + effectiveQty(r) * ((r.sale_price !== null && r.sale_price !== undefined) ? r.sale_price : (r.unit_cost || 0)), 0);
        const totalClients = new Set(spConsumos.map(r => r.client_id)).size || spClients.length;
        const totalM2sp = isFilm ? parseFloat(spConsumos.reduce((s, r) => s + getTotalM2(effectiveQty(r), r.size, r.film_type), 0).toFixed(1)) : 0;

        // Monthly trend (last 12 months)
        const now = new Date();
        const monthlyData = Array.from({ length: 12 }, (_, i) => {
          const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
          const label = d.toLocaleDateString('es-EC', { month: 'short', year: '2-digit' });
          const monthConsumos = spConsumos.filter(r => {
            const rd = new Date(r.order_date);
            return rd.getFullYear() === d.getFullYear() && rd.getMonth() === d.getMonth();
          });
          const units = monthConsumos.reduce((s, r) => s + effectiveQty(r), 0);
          const m2 = isFilm ? parseFloat(monthConsumos.reduce((s, r) => s + getTotalM2(effectiveQty(r), r.size, r.film_type), 0).toFixed(1)) : 0;
          const revenue = monthConsumos.reduce((s, r) => s + effectiveQty(r) * ((r.sale_price !== null && r.sale_price !== undefined) ? r.sale_price : (r.unit_cost || 0)), 0);
          return { label, units, m2, revenue };
        });

        // Top clients for this salesperson
        const clientDist = {} as Record<number, { qty: number; m2: number; revenue: number }>;
        spConsumos.forEach(r => {
          if (!clientDist[r.client_id]) clientDist[r.client_id] = { qty: 0, m2: 0, revenue: 0 };
          const q = effectiveQty(r);
          const rev = q * ((r.sale_price !== null && r.sale_price !== undefined) ? r.sale_price : (r.unit_cost || 0));
          clientDist[r.client_id].qty += q;
          clientDist[r.client_id].revenue += rev;
          if (isFilm) {
            clientDist[r.client_id].m2 = parseFloat((clientDist[r.client_id].m2 + getTotalM2(q, r.size, r.film_type)).toFixed(1));
          }
        });
        const topClients = Object.entries(clientDist)
          .map(([id, v]) => ({ name: allClients.find(c => c.id === parseInt(id))?.name || '?', qty: v.qty, m2: v.m2, revenue: v.revenue }))
          .sort((a, b) => isFilm ? b.m2 - a.m2 : b.revenue - a.revenue).slice(0, 8);
        const maxMetricTc = isFilm ? (topClients[0]?.m2 || 1) : (topClients[0]?.revenue || 1);

        // Item / Size distribution
        const itemDist = {} as Record<string, { qty: number; revenue: number; m2: number }>;
        spConsumos.forEach(r => {
          const name = isFilm
            ? (r.size || 'N/A')
            : (r.product_name || r.product_code || (r.size && r.size !== 'Varios' ? r.size : null) || 'Ítem General').trim();
          if (!itemDist[name]) itemDist[name] = { qty: 0, revenue: 0, m2: 0 };
          const q = effectiveQty(r);
          const rev = q * ((r.sale_price !== null && r.sale_price !== undefined) ? r.sale_price : (r.unit_cost || 0));
          itemDist[name].qty += q;
          itemDist[name].revenue += rev;
          if (isFilm) {
            itemDist[name].m2 = parseFloat((itemDist[name].m2 + getTotalM2(q, r.size, r.film_type)).toFixed(1));
          }
        });
        const itemData = Object.entries(itemDist)
          .map(([name, v]) => ({ name, qty: v.qty, revenue: v.revenue, m2: v.m2 }))
          .sort((a, b) => isFilm ? b.qty - a.qty : b.revenue - a.revenue).slice(0, 6);

        // Province distribution
        const provDist = {} as Record<string, number>;
        spConsumos.forEach(r => {
          const prov = allClients.find(c => c.id === r.client_id)?.province || 'Otra';
          provDist[prov] = (provDist[prov] || 0) + effectiveQty(r);
        });
        const provData = Object.entries(provDist).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 6);

        // Best month
        const bestMonth = [...monthlyData].sort((a, b) => isFilm ? b.units - a.units : b.revenue - a.revenue)[0] || { label: '—', units: 0, m2: 0, revenue: 0 };
        // Avg monthly
        const activeMonths = monthlyData.filter(m => m.units > 0 || m.revenue > 0).length || 1;
        const avgMonthlyUnits = (totalUnits / activeMonths).toFixed(1);
        const avgMonthlyRevenue = (totalRevenue / activeMonths).toFixed(2);

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setSelectedSalesperson(null)}>
            <div
              onClick={e => e.stopPropagation()}
              className={cn(
                "rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl custom-scrollbar",
                darkMode ? "bg-[#0F0F11] border border-white/10" : "bg-white border border-gray-200"
              )}
            >
              {/* Header */}
              <div className={cn("px-7 py-5 border-b flex items-center justify-between sticky top-0 z-10", darkMode ? "bg-[#0F0F11] border-white/8" : "bg-white border-gray-100")}>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#ED1C24] flex items-center justify-center font-black text-white text-lg">
                    {spName.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-xl font-black leading-none">{spName}</h2>
                    <p className={cn("text-xs mt-1 font-medium", darkMode ? "text-gray-500" : "text-gray-400")}>
                      Estadísticas del vendedor · <span className="font-bold text-[#ED1C24] uppercase">{activeCategoryLabel}</span>
                    </p>
                  </div>
                </div>
                <button onClick={() => setSelectedSalesperson(null)} className={cn("p-2 rounded-xl transition-colors", darkMode ? "hover:bg-white/10 text-gray-500" : "hover:bg-gray-100 text-gray-400")}>
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-7 space-y-7">
                {/* KPI Cards */}
                <div className="grid grid-cols-4 gap-4">
                  {isFilm ? [
                    { label: 'Total Cajas', value: totalUnits.toLocaleString(), sub: 'vendidas', color: darkMode ? 'text-white' : 'text-gray-800' },
                    { label: 'Total m²', value: totalM2sp.toLocaleString('es-EC', { maximumFractionDigits: 1 }), sub: 'metros cuadrados', color: darkMode ? 'text-cyan-400' : 'text-cyan-600' },
                    { label: 'Ingresos Totales', value: \`$\${totalRevenue.toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\`, sub: 'generados', color: 'text-[#ED1C24]' },
                    { label: 'Clientes Activos', value: totalClients.toString(), sub: 'centros médicos', color: darkMode ? 'text-white' : 'text-gray-800' },
                  ] : [
                    { label: 'Ingresos Generados', value: \`$\${totalRevenue.toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\`, sub: \`en \${activeCategoryLabel}\`, color: 'text-[#ED1C24]' },
                    { label: 'Unidades / Servicios', value: totalUnits.toLocaleString(), sub: 'transacciones', color: darkMode ? 'text-blue-400' : 'text-blue-600' },
                    { label: 'Clientes Atendidos', value: totalClients.toString(), sub: 'centros médicos', color: darkMode ? 'text-white' : 'text-gray-800' },
                    { label: 'Promedio Mensual', value: \`$\${parseFloat(avgMonthlyRevenue).toLocaleString('es-EC', { maximumFractionDigits: 0 })}\`, sub: 'ingreso / mes', color: darkMode ? 'text-emerald-400' : 'text-emerald-600' },
                  ].map((kpi, i) => (
                    <div key={i} className={cn("rounded-xl p-4 border", darkMode ? "bg-white/4 border-white/6" : "bg-gray-50 border-gray-100")}>
                      <p className={cn("text-[9px] font-bold uppercase tracking-wider mb-2", darkMode ? "text-gray-600" : "text-gray-400")}>{kpi.label}</p>
                      <p className={cn("text-2xl font-black leading-none", kpi.color)}>{kpi.value}</p>
                      <p className={cn("text-[10px] mt-1", darkMode ? "text-gray-600" : "text-gray-400")}>{kpi.sub}</p>
                    </div>
                  ))}
                </div>

                {/* Monthly trend chart */}
                <div className={cn("rounded-xl p-5 border", darkMode ? "bg-white/3 border-white/6" : "bg-gray-50 border-gray-100")}>
                  <div className="flex items-center justify-between mb-4">
                    <p className={cn("text-[10px] font-bold uppercase tracking-wider", darkMode ? "text-gray-500" : "text-gray-400")}>
                      Evolución mensual en {activeCategoryLabel} — últimos 12 meses
                    </p>
                    {(isFilm ? bestMonth.units > 0 : bestMonth.revenue > 0) && (
                      <span className={cn("text-[10px] font-semibold px-2.5 py-1 rounded-lg", darkMode ? "bg-emerald-500/15 text-emerald-400" : "bg-emerald-50 text-emerald-600")}>
                        Mejor mes: {bestMonth.label} · {isFilm ? \`\${bestMonth.units} cajas · \${bestMonth.m2} m²\` : \`$\${bestMonth.revenue.toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\`}
                      </span>
                    )}
                  </div>
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={monthlyData} barSize={20}>
                      <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.05)'} vertical={false} />
                      <XAxis dataKey="label" tick={{ fontSize: 9, fill: darkMode ? '#555' : '#aaa' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 9, fill: darkMode ? '#555' : '#aaa' }} axisLine={false} tickLine={false} width={38} tickFormatter={v => isFilm ? \`\${v}\` : \`$\${v}\`} />
                      <Tooltip
                        contentStyle={{ background: darkMode ? '#1a1a1e' : '#fff', border: \`1px solid \${darkMode ? 'rgba(255,255,255,0.08)' : '#eee'}\`, borderRadius: 10, fontSize: 11 }}
                        content={({ active, payload, label }) => {
                          if (!active || !payload?.length) return null;
                          const d = payload[0].payload;
                          return (
                            <div style={{ background: darkMode ? '#1a1a1e' : '#fff', border: \`1px solid \${darkMode ? 'rgba(255,255,255,0.08)' : '#eee'}\`, borderRadius: 10, padding: '8px 12px', fontSize: 11 }}>
                              <p style={{ fontWeight: 700, color: darkMode ? '#aaa' : '#666', marginBottom: 4 }}>{label}</p>
                              {isFilm ? (
                                <>
                                  <p style={{ color: '#ED1C24', fontWeight: 800 }}>{d.units} cajas</p>
                                  <p style={{ color: darkMode ? '#22d3ee' : '#0891b2', fontWeight: 600 }}>{d.m2} m²</p>
                                </>
                              ) : (
                                <>
                                  <p style={{ color: '#3B82F6', fontWeight: 800 }}>\${d.revenue.toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                  <p style={{ color: darkMode ? '#aaa' : '#666', fontWeight: 600 }}>{d.units} unidades / servicios</p>
                                </>
                              )}
                            </div>
                          );
                        }}
                        cursor={{ fill: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)' }}
                      />
                      <Bar dataKey={isFilm ? "units" : "revenue"} fill={isFilm ? "#ED1C24" : "#3B82F6"} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Bottom: Top Clients + Size/Item dist + Province */}
                <div className="grid grid-cols-12 gap-5">
                  {/* Top Clients */}
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
                  </div>

                  {/* Size/Item + Province */}
                  <div className="col-span-6 space-y-4">
                    {/* Item distribution */}
                    <div className={cn("rounded-xl p-5 border", darkMode ? "bg-white/3 border-white/6" : "bg-gray-50 border-gray-100")}>
                      <p className={cn("text-[10px] font-bold uppercase tracking-wider mb-3", darkMode ? "text-gray-500" : "text-gray-400")}>
                        {isFilm ? 'Distribución por medida' : 'Distribución por producto / ítem'}
                      </p>
                      <div className="space-y-2">
                        {itemData.map((s, i) => {
                          const maxVal = isFilm ? (itemData[0]?.qty || 1) : (itemData[0]?.revenue || 1);
                          const currentVal = isFilm ? s.qty : s.revenue;
                          return (
                            <div key={i} className="flex items-center gap-3">
                              <span className={cn("text-[10px] font-black uppercase px-1.5 py-0.5 rounded truncate w-24 shrink-0", darkMode ? "bg-white/10 text-gray-300" : "bg-gray-200 text-gray-700")} title={s.name}>{s.name || 'N/A'}</span>
                              <div className={cn("flex-1 h-2 rounded-full overflow-hidden", darkMode ? "bg-white/6" : "bg-gray-200")}>
                                <div className="h-full rounded-full bg-[#ED1C24]/70" style={{ width: \`\${(currentVal / maxVal) * 100}%\` }} />
                              </div>
                              <span className={cn("text-xs font-black text-right shrink-0", darkMode ? "text-gray-300" : "text-gray-700")}>
                                {isFilm ? (
                                  <>{s.qty} <span className={cn("text-[9px] font-normal", darkMode ? "text-cyan-500" : "text-cyan-600")}>{s.m2} m²</span></>
                                ) : (
                                  <>\$\${s.revenue.toLocaleString('es-EC', { maximumFractionDigits: 0 })}</>
                                )}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    {/* Province distribution */}
                    <div className={cn("rounded-xl p-5 border", darkMode ? "bg-white/3 border-white/6" : "bg-gray-50 border-gray-100")}>
                      <p className={cn("text-[10px] font-bold uppercase tracking-wider mb-3", darkMode ? "text-gray-500" : "text-gray-400")}>Distribución por provincia</p>
                      <div className="space-y-2">
                        {provData.map((p, i) => (
                          <div key={i} className="flex items-center gap-3">
                            <span className={cn("text-[10px] font-semibold capitalize truncate w-24 shrink-0", darkMode ? "text-gray-400" : "text-gray-600")}>{p.name}</span>
                            <div className={cn("flex-1 h-2 rounded-full overflow-hidden", darkMode ? "bg-white/6" : "bg-gray-200")}>
                              <div className="h-full rounded-full bg-blue-500/70" style={{ width: \`\${(p.value / (provData[0]?.value || 1)) * 100}%\` }} />
                            </div>
                            <span className={cn("text-xs font-black w-8 text-right shrink-0", darkMode ? "text-gray-300" : "text-gray-700")}>{p.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );`;

if (file.includes(oldModalFullBlock)) {
  file = file.replace(oldModalFullBlock, newModalFullBlock);
  console.log('Salesperson modal full block replaced cleanly');
} else {
  console.log('Salesperson modal full block pattern not found');
}

fs.writeFileSync('src/App.tsx', file.replace(/\n/g, '\r\n'), 'utf8');
