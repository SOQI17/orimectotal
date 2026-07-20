const fs = require('fs');

let file = fs.readFileSync('src/App.tsx', 'utf8').replace(/\r\n/g, '\n');

// 1. Update PurchasesDashboardView props signature and add non-films handling
const oldViewSignature = `function PurchasesDashboardView({ darkMode, globalMetrics, allConsumos }: {
  darkMode: boolean;
  globalMetrics: any;
  allConsumos: any[];
}) {`;

const newViewSignature = `function PurchasesDashboardView({ darkMode, globalMetrics, allConsumos, activeCategory, activeCategoryLabel, stockEntries }: {
  darkMode: boolean;
  globalMetrics: any;
  allConsumos: any[];
  activeCategory?: string;
  activeCategoryLabel?: string;
  stockEntries?: any[];
}) {
  if (activeCategory && activeCategory !== 'PELICULAS' && activeCategory !== 'ALL') {
    const productMap: Record<string, { qty: number; costoTotal: number; ventaTotal: number; code?: string }> = {};

    allConsumos.forEach((r: any) => {
      const qty = effectiveQty(r);
      const cost = r.unit_cost || 0;
      const price = (r.sale_price !== null && r.sale_price !== undefined) ? r.sale_price : (r.unit_cost || 0);
      const name = (r.product_name || r.product_code || (r.size && r.size !== 'Varios' ? r.size : null) || 'Ítem General').trim();
      if (!productMap[name]) {
        productMap[name] = { qty: 0, costoTotal: 0, ventaTotal: 0, code: r.product_code };
      }
      productMap[name].qty += qty;
      productMap[name].costoTotal += (qty * cost);
      productMap[name].ventaTotal += (qty * price);
    });

    const totalInversion = Object.values(productMap).reduce((s, p) => s + p.costoTotal, 0);
    const totalVentas = Object.values(productMap).reduce((s, p) => s + p.ventaTotal, 0);
    const totalUnidades = Object.values(productMap).reduce((s, p) => s + p.qty, 0);
    const utilidadTotal = totalVentas - totalInversion;
    const margenPromedio = totalVentas > 0 ? ((utilidadTotal / totalVentas) * 100) : 0;

    const productRows = Object.entries(productMap).map(([name, p]) => {
      const costoUni = p.qty > 0 ? p.costoTotal / p.qty : 0;
      const precioUni = p.qty > 0 ? p.ventaTotal / p.qty : 0;
      const utilidad = p.ventaTotal - p.costoTotal;
      const margen = p.ventaTotal > 0 ? ((utilidad / p.ventaTotal) * 100) : 0;
      return { name, code: p.code, qty: p.qty, costoTotal: p.costoTotal, ventaTotal: p.ventaTotal, costoUni, precioUni, utilidad, margen };
    }).sort((a, b) => b.ventaTotal - a.ventaTotal);

    return (
      <div className="flex flex-col gap-5">
        <div className={cn('px-4 py-2.5 rounded-xl border flex items-center gap-3', darkMode ? 'bg-blue-500/8 border-blue-500/20' : 'bg-blue-50 border-blue-200')}>
          <span className="text-base shrink-0">📋</span>
          <p className={cn('text-[9px] leading-relaxed', darkMode ? 'text-blue-300' : 'text-blue-700')}>
            <strong>Análisis de Compras & Márgenes ({activeCategoryLabel || activeCategory}):</strong> Inversión calculada a partir de los costos unitarios de adquisición y facturación registrada. Márgenes y rentabilidad calculados en función del valor de venta real vs costo de adquisición.
          </p>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <div className={cn('p-5 rounded-xl border', darkMode ? 'bg-blue-500/10 border-blue-500/20' : 'bg-blue-50 border-blue-200')}>
            <p className={cn('text-[9px] font-bold uppercase tracking-wider mb-2', darkMode ? 'text-gray-500' : 'text-gray-500')}>Inversión Total Compras</p>
            <p className={cn('text-3xl font-black leading-none', darkMode ? 'text-blue-400' : 'text-blue-700')}>
              \${totalInversion.toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className={cn('text-[9px] mt-1', darkMode ? 'text-gray-600' : 'text-gray-400')}>{productRows.length} productos registrados</p>
          </div>
          <div className={cn('p-5 rounded-xl border', darkMode ? 'bg-cyan-500/10 border-cyan-500/20' : 'bg-cyan-50 border-cyan-200')}>
            <p className={cn('text-[9px] font-bold uppercase tracking-wider mb-2', darkMode ? 'text-gray-500' : 'text-gray-500')}>Unidades Compradas / Movidas</p>
            <p className={cn('text-3xl font-black leading-none', darkMode ? 'text-cyan-400' : 'text-cyan-700')}>
              {totalUnidades.toLocaleString()} unid.
            </p>
            <p className={cn('text-[9px] mt-1', darkMode ? 'text-gray-600' : 'text-gray-400')}>en línea de {activeCategoryLabel || activeCategory}</p>
          </div>
          <div className={cn('p-5 rounded-xl border', darkMode ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-emerald-50 border-emerald-200')}>
            <p className={cn('text-[9px] font-bold uppercase tracking-wider mb-2', darkMode ? 'text-gray-500' : 'text-gray-500')}>Ventas Estimadas / Realizadas</p>
            <p className={cn('text-3xl font-black leading-none', darkMode ? 'text-emerald-400' : 'text-emerald-700')}>
              \${totalVentas.toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className={cn('text-[9px] mt-1', darkMode ? 'text-gray-600' : 'text-gray-400')}>facturación generada</p>
          </div>
          <div className={cn('p-5 rounded-xl border', darkMode ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-emerald-50 border-emerald-200')}>
            <p className={cn('text-[9px] font-bold uppercase tracking-wider mb-2', darkMode ? 'text-gray-500' : 'text-gray-500')}>Margen Bruto Promedio</p>
            <p className="text-3xl font-black leading-none text-emerald-400">
              {margenPromedio.toFixed(1)}%
            </p>
            <p className={cn('text-[9px] mt-1', darkMode ? 'text-gray-600' : 'text-gray-400')}>Utilidad est. \${utilidadTotal.toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-5">
          <div className={cn('col-span-8 rounded-xl border overflow-hidden', darkMode ? 'bg-[#16161A] border-white/8' : 'bg-white border-gray-200 shadow-sm')}>
            <div className={cn('px-5 py-4 border-b', darkMode ? 'border-white/8 bg-white/3' : 'border-gray-100 bg-gray-50')}>
              <p className={cn('text-xs font-black', darkMode ? 'text-white' : 'text-gray-900')}>Análisis de Compras y Rentabilidad por Producto ({activeCategoryLabel || activeCategory})</p>
              <p className={cn('text-[9px] mt-0.5', darkMode ? 'text-gray-500' : 'text-gray-400')}>Comparativo entre costo unitario de adquisición vs precio de venta e ingresos totales</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className={cn('text-[8px] font-bold uppercase tracking-wider', darkMode ? 'text-gray-600 bg-white/2' : 'text-gray-400 bg-gray-50')}>
                  <tr className={cn('border-b', darkMode ? 'border-white/6' : 'border-gray-100')}>
                    <th className="px-5 py-2.5 text-left">Producto / Descripción</th>
                    <th className="px-4 py-2.5 text-right">Qty</th>
                    <th className="px-4 py-2.5 text-right">Costo Uni ($)</th>
                    <th className="px-4 py-2.5 text-right">Precio Venta ($)</th>
                    <th className="px-4 py-2.5 text-center">Margen</th>
                    <th className="px-4 py-2.5 text-right">Inversión</th>
                    <th className="px-4 py-2.5 text-right">Venta Total</th>
                  </tr>
                </thead>
                <tbody className={cn('divide-y', darkMode ? 'divide-white/4' : 'divide-gray-50')}>
                  {productRows.map((row, i) => (
                    <tr key={i} className={cn('transition-colors', darkMode ? 'hover:bg-white/3' : 'hover:bg-gray-50/60')}>
                      <td className="px-5 py-3">
                        <p className="font-semibold text-xs truncate max-w-[220px]">{row.name}</p>
                        {row.code && <p className={cn('text-[8px] font-mono mt-0.5', darkMode ? 'text-gray-600' : 'text-gray-400')}>Cód: {row.code}</p>}
                      </td>
                      <td className={cn('px-4 py-3 text-right font-black', darkMode ? 'text-gray-300' : 'text-gray-700')}>{row.qty}</td>
                      <td className={cn('px-4 py-3 text-right font-mono text-[10px]', darkMode ? 'text-red-400' : 'text-red-600')}>$\${row.costoUni.toFixed(2)}</td>
                      <td className={cn('px-4 py-3 text-right font-mono text-[10px] font-bold', darkMode ? 'text-emerald-400' : 'text-emerald-600')}>$\${row.precioUni.toFixed(2)}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={cn('text-[9px] font-black px-2 py-0.5 rounded-full', row.margen >= 0 ? (darkMode ? 'bg-emerald-500/15 text-emerald-400' : 'bg-emerald-50 text-emerald-600') : 'bg-red-500/15 text-red-400')}>{row.margen.toFixed(0)}%</span>
                      </td>
                      <td className={cn('px-4 py-3 text-right text-[10px] font-bold', darkMode ? 'text-gray-400' : 'text-gray-600')}>$\${row.costoTotal.toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td className={cn('px-4 py-3 text-right font-bold text-[10px]', darkMode ? 'text-emerald-400' : 'text-emerald-600')}>$\${row.ventaTotal.toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    </tr>
                  ))}
                  {productRows.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-5 py-8 text-center text-gray-500">
                        No hay compras o registros en la línea de {activeCategoryLabel || activeCategory}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="col-span-4 flex flex-col gap-4">
            <div className={cn('rounded-xl border p-5', darkMode ? 'bg-[#16161A] border-white/8' : 'bg-white border-gray-200 shadow-sm')}>
              <p className={cn('text-[10px] font-bold uppercase tracking-wider mb-4', darkMode ? 'text-gray-500' : 'text-gray-400')}>Top Productos por Inversión</p>
              <div className="flex flex-col gap-3">
                {productRows.slice(0, 6).map((row) => (
                  <div key={row.name} className="flex justify-between items-center pb-2 border-b border-white/5 last:border-none">
                    <div className="min-w-0 flex-1 pr-2">
                      <p className="font-semibold text-xs truncate">{row.name}</p>
                      <p className={cn('text-[9px]', darkMode ? 'text-gray-500' : 'text-gray-400')}>{row.qty} unidades</p>
                    </div>
                    <span className="font-black text-xs text-emerald-400 shrink-0">\${row.ventaTotal.toLocaleString('es-EC', { maximumFractionDigits: 0 })}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }`;

if (file.includes(oldViewSignature)) {
  file = file.replace(oldViewSignature, newViewSignature);
  console.log('1. PurchasesDashboardView updated for non-films');
} else {
  console.log('1. PurchasesDashboardView signature pattern not found');
}

// 2. Update invocation of PurchasesDashboardView in JSX
const oldInvocation = `            {/* ── PURCHASES DASHBOARD ── */}
            {dashboardView === 'compras' && (
              <PurchasesDashboardView
                darkMode={darkMode}
                globalMetrics={globalMetrics}
                allConsumos={activeCategoryConsumos}
              />
            )}`;

const newInvocation = `            {/* ── PURCHASES DASHBOARD ── */}
            {dashboardView === 'compras' && (
              <PurchasesDashboardView
                darkMode={darkMode}
                globalMetrics={globalMetrics}
                allConsumos={activeCategoryConsumos}
                activeCategory={activeCategory}
                activeCategoryLabel={activeCategoryLabel}
                stockEntries={stockEntries}
              />
            )}`;

if (file.includes(oldInvocation)) {
  file = file.replace(oldInvocation, newInvocation);
  console.log('2. PurchasesDashboardView invocation updated');
} else {
  console.log('2. PurchasesDashboardView invocation pattern not found');
}

fs.writeFileSync('src/App.tsx', file.replace(/\n/g, '\r\n'), 'utf8');
