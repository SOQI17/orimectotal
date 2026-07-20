const fs = require('fs');

let file = fs.readFileSync('src/App.tsx', 'utf8').replace(/\r\n/g, '\n');

// 1. Update state definition for productDetailModal to include records
const oldStateDef = `  const [productDetailModal, setProductDetailModal] = useState<{
    productName: string;
    fullName: string;
    totalRevenue: number;
    totalUnits: number;
    clients: { id: number; name: string; salesperson: string; province: string; units: number; revenue: number }[];
  } | null>(null);`;

const newStateDef = `  const [productDetailModal, setProductDetailModal] = useState<{
    productName: string;
    fullName: string;
    totalRevenue: number;
    totalUnits: number;
    clients: { id: number; name: string; salesperson: string; province: string; units: number; revenue: number }[];
    records: { id: string; order_date: string; invoice_number?: string; client_id: number; client_name: string; quantity: number; price: number; total: number; product_name: string }[];
  } | null>(null);`;

if (file.includes(oldStateDef)) {
  file = file.replace(oldStateDef, newStateDef);
  console.log('1. productDetailModal state definition updated with records');
} else {
  console.log('1. productDetailModal state definition pattern not found');
}

// 2. Update productDistributionChartData memo
const oldChartMemo = `    } else {
      const distRevenue = {} as Record<string, { fullName: string; revenue: number; quantity: number }>;
      dated.forEach(r => {
        const price = (r.sale_price !== null && r.sale_price !== undefined) ? r.sale_price : (r.unit_cost || 0);
        const qty = r.is_return ? -r.quantity : r.quantity;
        const rev = qty * price;
        const full = (r.product_name || r.product_code || (r.size && r.size !== 'Varios' ? r.size : null) || 'Ítem General').trim();
        let displayName = full;
        if (displayName.length > 25) displayName = displayName.substring(0, 22) + '...';

        if (!distRevenue[displayName]) {
          distRevenue[displayName] = { fullName: full, revenue: 0, quantity: 0 };
        }
        distRevenue[displayName].revenue = parseFloat((distRevenue[displayName].revenue + rev).toFixed(2));
        distRevenue[displayName].quantity += qty;
      });
      return Object.entries(distRevenue)
        .map(([name, data]) => ({ name, fullName: data.fullName, revenue: data.revenue, quantity: data.quantity }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10);
    }`;

const newChartMemo = `    } else {
      const distRevenue = {} as Record<string, { fullName: string; revenue: number; quantity: number }>;
      dated.forEach(r => {
        const price = (r.sale_price !== null && r.sale_price !== undefined) ? r.sale_price : (r.unit_cost || 0);
        const qty = r.is_return ? -r.quantity : r.quantity;
        const rev = qty * price;
        const full = (
          r.product_name ||
          r.product_code ||
          r.notes ||
          (r.size && r.size !== 'Varios' ? r.size : null) ||
          r.invoice_number ||
          'Varios'
        ).trim();
        let displayName = full;
        if (displayName.length > 25) displayName = displayName.substring(0, 22) + '...';

        if (!distRevenue[displayName]) {
          distRevenue[displayName] = { fullName: full, revenue: 0, quantity: 0 };
        }
        distRevenue[displayName].revenue = parseFloat((distRevenue[displayName].revenue + rev).toFixed(2));
        distRevenue[displayName].quantity += qty;
      });
      return Object.entries(distRevenue)
        .map(([name, data]) => ({ name, fullName: data.fullName, revenue: data.revenue, quantity: data.quantity }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10);
    }`;

if (file.includes(oldChartMemo)) {
  file = file.replace(oldChartMemo, newChartMemo);
  console.log('2. productDistributionChartData memo updated');
} else {
  console.log('2. productDistributionChartData memo pattern not found');
}

// 3. Update Bar onClick handler
const oldBarOnClick = `                        onClick={(entry: any) => {
                          const chartItem = entry?.payload || entry;
                          if (!chartItem || (!chartItem.name && !chartItem.fullName)) return;
                          const name = chartItem.name || chartItem.fullName;
                          const fullNameTarget = chartItem.fullName || name;
                          const cleanPrefix = name.replace(/\\.\\.\\.\$/, '').trim().toLowerCase();

                          const clientMap: Record<number, { id: number; name: string; salesperson: string; province: string; units: number; revenue: number }> = {};
                          let totalRevenue = 0;
                          let totalUnits = 0;
                          let displayFullName = fullNameTarget;

                          activeCategoryConsumos.forEach(r => {
                            if (dashboardStartDate && new Date(r.order_date) < new Date(dashboardStartDate)) return;
                            if (dashboardEndDate && new Date(r.order_date) > new Date(dashboardEndDate)) return;

                            const prodName = (r.product_name || r.product_code || (r.size && r.size !== 'Varios' ? r.size : null) || 'Ítem General').trim();
                            const prodNameLower = prodName.toLowerCase();

                            const match = (activeCategory === 'PELICULAS' || activeCategory === 'ALL')
                              ? r.size === name
                              : (prodName === fullNameTarget || prodNameLower.startsWith(cleanPrefix) || (r.product_code && r.product_code === name) || r.size === name);

                            if (match) {
                              if (r.product_name) displayFullName = r.product_name;
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
                          setProductDetailModal({ productName: name, fullName: displayFullName, totalRevenue, totalUnits, clients });
                        }}`;

const newBarOnClick = `                        onClick={(entry: any) => {
                          const chartItem = entry?.payload || entry;
                          if (!chartItem || (!chartItem.name && !chartItem.fullName)) return;
                          const name = chartItem.name || chartItem.fullName;
                          const fullNameTarget = chartItem.fullName || name;
                          const cleanPrefix = name.replace(/\\.\\.\\.\$/, '').trim().toLowerCase();

                          const clientMap: Record<number, { id: number; name: string; salesperson: string; province: string; units: number; revenue: number }> = {};
                          const records: any[] = [];
                          let totalRevenue = 0;
                          let totalUnits = 0;
                          let displayFullName = fullNameTarget;

                          activeCategoryConsumos.forEach(r => {
                            if (dashboardStartDate && new Date(r.order_date) < new Date(dashboardStartDate)) return;
                            if (dashboardEndDate && new Date(r.order_date) > new Date(dashboardEndDate)) return;

                            const prodName = (
                              r.product_name ||
                              r.product_code ||
                              r.notes ||
                              (r.size && r.size !== 'Varios' ? r.size : null) ||
                              r.invoice_number ||
                              'Varios'
                            ).trim();

                            const prodNameLower = prodName.toLowerCase();

                            const match = (activeCategory === 'PELICULAS' || activeCategory === 'ALL')
                              ? r.size === name
                              : (
                                  prodName === fullNameTarget ||
                                  prodNameLower === cleanPrefix ||
                                  prodNameLower.startsWith(cleanPrefix) ||
                                  (r.product_code && r.product_code === name) ||
                                  r.size === name ||
                                  (name === 'Varios' && (r.size === 'Varios' || !r.product_name))
                                );

                            if (match) {
                              if (r.product_name) displayFullName = r.product_name;
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

                              records.push({
                                id: r.id,
                                order_date: r.order_date,
                                invoice_number: r.invoice_number,
                                client_id: r.client_id,
                                client_name: cName,
                                quantity: qty,
                                price,
                                total: rev,
                                product_name: r.product_name || r.notes || r.product_code || r.size || 'Varios'
                              });
                            }
                          });

                          const clients = Object.values(clientMap).sort((a, b) => b.revenue - a.revenue);
                          records.sort((a, b) => new Date(b.order_date).getTime() - new Date(a.order_date).getTime());
                          setProductDetailModal({ productName: name, fullName: displayFullName, totalRevenue, totalUnits, clients, records });
                        }}`;

if (file.includes(oldBarOnClick)) {
  file = file.replace(oldBarOnClick, newBarOnClick);
  console.log('3. Bar onClick handler updated');
} else {
  console.log('3. Bar onClick handler pattern not found');
}

// 4. Render productDetailModal JSX with clients AND records table
const oldModalJSX = `      {/* Modal de Detalle de Producto al dar clic en la barra del gráfico */}
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
      )}`;

const newModalJSX = `      {/* Modal de Detalle de Producto al dar clic en la barra del gráfico */}
      {productDetailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setProductDetailModal(null)}>
          <div
            onClick={e => e.stopPropagation()}
            className={cn("rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl border max-h-[85vh] flex flex-col",
              darkMode ? "bg-[#16161A] border-white/10 text-white" : "bg-white border-gray-200 text-gray-800"
            )}
          >
            <div className={cn("px-6 py-4 border-b flex items-center justify-between shrink-0",
              darkMode ? "bg-white/4 border-white/8" : "bg-gray-50 border-gray-100"
            )}>
              <div>
                <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-[#ED1C24]/15 text-[#ED1C24]">
                  {activeCategoryLabel}
                </span>
                <h3 className="text-base font-black tracking-tight mt-1 truncate max-w-lg" title={productDetailModal.fullName}>
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

            <div className="p-6 overflow-y-auto custom-scrollbar space-y-6 flex-1">
              {/* Sección 1: Clientes */}
              <div>
                <h4 className={cn("text-[10px] font-bold uppercase tracking-wider mb-3 flex items-center justify-between", darkMode ? "text-gray-500" : "text-gray-400")}>
                  <span>Clientes que compraron este producto / ítem</span>
                  <span>{productDetailModal.clients.length} cliente(s)</span>
                </h4>
                <div className="space-y-2">
                  {productDetailModal.clients.map((c) => (
                    <div key={c.id} className={cn("p-3 rounded-xl border flex items-center justify-between transition-colors",
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
                    <p className={cn("text-xs text-center py-4", darkMode ? "text-gray-500" : "text-gray-400")}>
                      No se encontraron clientes para este producto en el período seleccionado.
                    </p>
                  )}
                </div>
              </div>

              {/* Sección 2: Transacciones / Facturas */}
              {productDetailModal.records && productDetailModal.records.length > 0 && (
                <div>
                  <h4 className={cn("text-[10px] font-bold uppercase tracking-wider mb-3 flex items-center justify-between", darkMode ? "text-gray-500" : "text-gray-400")}>
                    <span>Facturas / Registros incluidos</span>
                    <span>{productDetailModal.records.length} transacciones</span>
                  </h4>
                  <div className={cn("rounded-xl border overflow-hidden", darkMode ? "border-white/8" : "border-gray-200")}>
                    <table className="w-full text-xs">
                      <thead className={cn("text-[8px] font-bold uppercase tracking-wider", darkMode ? "bg-white/4 text-gray-500" : "bg-gray-50 text-gray-400")}>
                        <tr>
                          <th className="px-3 py-2 text-left">Fecha</th>
                          <th className="px-3 py-2 text-left">Cliente</th>
                          <th className="px-3 py-2 text-left">Factura</th>
                          <th className="px-3 py-2 text-right">Cant.</th>
                          <th className="px-3 py-2 text-right">P. Unit</th>
                          <th className="px-3 py-2 text-right">Total ($)</th>
                        </tr>
                      </thead>
                      <tbody className={cn("divide-y", darkMode ? "divide-white/4" : "divide-gray-100")}>
                        {productDetailModal.records.slice(0, 15).map((r, idx) => (
                          <tr key={r.id || idx} className={cn("transition-colors", darkMode ? "hover:bg-white/4" : "hover:bg-gray-50")}>
                            <td className="px-3 py-2 font-mono text-[10px] whitespace-nowrap">{r.order_date}</td>
                            <td className="px-3 py-2 font-semibold truncate max-w-[150px]">{r.client_name}</td>
                            <td className={cn("px-3 py-2 font-mono text-[10px]", darkMode ? "text-gray-400" : "text-gray-500")}>{r.invoice_number || '—'}</td>
                            <td className="px-3 py-2 text-right font-bold">{r.quantity}</td>
                            <td className="px-3 py-2 text-right font-mono text-[10px]">\${r.price.toFixed(2)}</td>
                            <td className="px-3 py-2 text-right font-bold text-emerald-400">\${r.total.toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}`;

if (file.includes(oldModalJSX)) {
  file = file.replace(oldModalJSX, newModalJSX);
  console.log('4. productDetailModal JSX updated with clients AND transactions table');
} else {
  console.log('4. productDetailModal JSX pattern not found');
}

fs.writeFileSync('src/App.tsx', file.replace(/\n/g, '\r\n'), 'utf8');
