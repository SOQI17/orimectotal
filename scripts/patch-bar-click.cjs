const fs = require('fs');

let file = fs.readFileSync('src/App.tsx', 'utf8').replace(/\r\n/g, '\n');

// 1. Add state for productDetailModal
const oldStateAnchor = `  const [comparativoCellDetail, setComparativoCellDetail] = useState<{`;
const newStateAnchor = `  const [productDetailModal, setProductDetailModal] = useState<{
    productName: string;
    fullName: string;
    totalRevenue: number;
    totalUnits: number;
    clients: { id: number; name: string; salesperson: string; province: string; units: number; revenue: number }[];
  } | null>(null);
  const [comparativoCellDetail, setComparativoCellDetail] = useState<{`;

if (file.includes(oldStateAnchor)) {
  file = file.replace(oldStateAnchor, newStateAnchor);
  console.log('1. productDetailModal state added');
} else {
  console.log('1. productDetailModal state anchor not found');
}

// 2. Add sub-label in Chart header: "Haz clic en una barra para ver clientes"
const oldChartHeader = `<h3 className={cn("text-[10px] font-bold uppercase tracking-wider flex items-center gap-2", darkMode ? "text-gray-500" : "text-gray-400")}>
                    <BarChart3 className="w-3.5 h-3.5 text-[#ED1C24]" /> 
                    {activeCategory === 'PELICULAS' || activeCategory === 'ALL'
                      ? 'Distribución Global por Medida — m²'
                      : \`Distribución por Producto — Ventas ($)\`
                    }
                  </h3>`;

const newChartHeader = `<h3 className={cn("text-[10px] font-bold uppercase tracking-wider flex items-center gap-2", darkMode ? "text-gray-500" : "text-gray-400")}>
                    <BarChart3 className="w-3.5 h-3.5 text-[#ED1C24]" /> 
                    {activeCategory === 'PELICULAS' || activeCategory === 'ALL'
                      ? 'Distribución Global por Medida — m²'
                      : \`Top Productos / Desglose por Ítem — Ventas ($)\`
                    }
                    <span className={cn("normal-case text-[9px] font-normal ml-2", darkMode ? "text-cyan-400/80" : "text-cyan-600/80")}>
                      (Haz clic en una barra para ver clientes)
                    </span>
                  </h3>`;

if (file.includes(oldChartHeader)) {
  file = file.replace(oldChartHeader, newChartHeader);
  console.log('2. Chart header title updated');
} else {
  console.log('2. Chart header title pattern not found');
}

// 3. Make Bar clickable with onClick
const oldBar = `                      <Bar
                        dataKey={(activeCategory === 'PELICULAS' || activeCategory === 'ALL') ? "m2" : "revenue"}
                        name={(activeCategory === 'PELICULAS' || activeCategory === 'ALL') ? "m2" : "revenue"}
                        radius={[6, 6, 0, 0]}
                        barSize={50}
                      >`;

const newBar = `                      <Bar
                        dataKey={(activeCategory === 'PELICULAS' || activeCategory === 'ALL') ? "m2" : "revenue"}
                        name={(activeCategory === 'PELICULAS' || activeCategory === 'ALL') ? "m2" : "revenue"}
                        radius={[6, 6, 0, 0]}
                        barSize={50}
                        cursor="pointer"
                        onClick={(entry: any) => {
                          if (!entry || !entry.name) return;
                          const name = entry.name;
                          const clientMap: Record<number, { id: number; name: string; salesperson: string; province: string; units: number; revenue: number }> = {};
                          let totalRevenue = 0;
                          let totalUnits = 0;
                          let fullName = name;

                          activeCategoryConsumos.forEach(r => {
                            if (dashboardStartDate && new Date(r.order_date) < new Date(dashboardStartDate)) return;
                            if (dashboardEndDate && new Date(r.order_date) > new Date(dashboardEndDate)) return;

                            const prodName = (r.product_name || r.product_code || (r.size && r.size !== 'Varios' ? r.size : null) || 'Ítem General').trim();
                            const match = (activeCategory === 'PELICULAS' || activeCategory === 'ALL')
                              ? r.size === name
                              : (prodName.startsWith(name) || prodName === name || r.size === name || r.product_code === name);

                            if (match) {
                              if (r.product_name) fullName = r.product_name;
                              const qty = effectiveQty(r);
                              const price = (r.sale_price !== null && r.sale_price !== undefined) ? r.sale_price : (r.unit_cost || 0);
                              const rev = qty * price;
                              totalRevenue += rev;
                              totalUnits += qty;

                              const c = clientsById.get(r.client_id);
                              const cName = c?.name || 'Desconocido';
                              if (!clientMap[r.client_id]) {
                                clientMap[r.client_id] = {
                                  id: r.client_id,
                                  name: cName,
                                  salesperson: c?.salesperson || '—',
                                  province: c?.province || '—',
                                  units: 0,
                                  revenue: 0
                                };
                              }
                              clientMap[r.client_id].units += qty;
                              clientMap[r.client_id].revenue += rev;
                            }
                          });

                          const clients = Object.values(clientMap).sort((a, b) => b.revenue - a.revenue);
                          setProductDetailModal({ productName: name, fullName, totalRevenue, totalUnits, clients });
                        }}
                      >`;

if (file.includes(oldBar)) {
  file = file.replace(oldBar, newBar);
  console.log('3. Bar onClick added successfully');
} else {
  console.log('3. Bar pattern not found');
}

// 4. Render productDetailModal in JSX
const oldModalRenderAnchor = `      {/* Modal de Registro */}`;
const newModalRenderAnchor = `      {/* Modal de Detalle de Producto al dar clic en la barra del gráfico */}
      {productDetailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className={cn("rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl border",
            darkMode ? "bg-[#16161A] border-white/10 text-white" : "bg-white border-gray-200 text-gray-800"
          )}>
            <div className={cn("px-6 py-4 border-b flex items-center justify-between",
              darkMode ? "bg-white/4 border-white/8" : "bg-gray-50 border-gray-100"
            )}>
              <div>
                <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-[#ED1C24]/15 text-[#ED1C24]">
                  {activeCategoryLabel}
                </span>
                <h3 className="text-base font-black tracking-tight mt-1 truncate max-w-md" title={productDetailModal.fullName}>
                  {productDetailModal.fullName}
                </h3>
                <p className={cn("text-[10px] mt-0.5", darkMode ? "text-gray-400" : "text-gray-500")}>
                  Total vendido: <span className="font-bold text-emerald-400">\${productDetailModal.totalRevenue.toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span> · {productDetailModal.totalUnits} unidades · {productDetailModal.clients.length} cliente(s)
                </p>
              </div>
              <button onClick={() => setProductDetailModal(null)} className={cn("p-2 rounded-full transition-colors", darkMode ? "hover:bg-white/10 text-gray-400" : "hover:bg-gray-200")}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 max-h-[450px] overflow-y-auto custom-scrollbar">
              <h4 className={cn("text-[10px] font-bold uppercase tracking-wider mb-3", darkMode ? "text-gray-500" : "text-gray-400")}>
                Clientes que compraron este producto / ítem
              </h4>
              <div className="space-y-2">
                {productDetailModal.clients.map((c) => (
                  <div key={c.id} className={cn("p-3.5 rounded-xl border flex items-center justify-between transition-colors",
                    darkMode ? "bg-white/3 border-white/6 hover:bg-white/6" : "bg-gray-50 border-gray-100 hover:bg-gray-100/80"
                  )}>
                    <div className="flex-1 min-w-0 pr-3">
                      <p className="font-semibold text-xs truncate">{c.name}</p>
                      <p className={cn("text-[9px] mt-0.5", darkMode ? "text-gray-500" : "text-gray-400")}>
                        {c.province} · Vendedor: {c.salesperson}
                      </p>
                    </div>
                    <div className="text-right pr-4 shrink-0">
                      <p className="font-black text-xs text-emerald-400">
                        \${c.revenue.toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                      <p className={cn("text-[9px]", darkMode ? "text-gray-500" : "text-gray-400")}>
                        {c.units} unid.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        const clientObj = allClients.find(cl => cl.id === c.id);
                        if (clientObj) {
                          setSelectedClient(clientObj);
                          setView('clients');
                          setProductDetailModal(null);
                        }
                      }}
                      className={cn("px-3 py-1.5 rounded-xl text-[10px] font-black transition-all flex items-center gap-1 shrink-0 border cursor-pointer",
                        darkMode ? "bg-white/8 border-white/10 text-cyan-400 hover:bg-white/15" : "bg-white border-gray-200 text-cyan-600 hover:bg-gray-50 shadow-sm"
                      )}
                    >
                      <span>Ir al cliente</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {productDetailModal.clients.length === 0 && (
                  <p className={cn("text-xs text-center py-6", darkMode ? "text-gray-500" : "text-gray-400")}>
                    No se encontraron clientes para este producto en el período seleccionado.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Registro */}`;

if (file.includes(oldModalRenderAnchor)) {
  file = file.replace(oldModalRenderAnchor, newModalRenderAnchor);
  console.log('4. productDetailModal JSX added successfully');
} else {
  console.log('4. Modal de Registro anchor not found');
}

fs.writeFileSync('src/App.tsx', file.replace(/\n/g, '\r\n'), 'utf8');
