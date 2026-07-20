const fs = require('fs');

let file = fs.readFileSync('src/App.tsx', 'utf8').replace(/\r\n/g, '\n');

// 1. Update productDistributionChartData to include fullName
const oldDistMemo = `    } else {
      const distRevenue = {} as Record<string, number>;
      const distQty = {} as Record<string, number>;
      dated.forEach(r => {
        const price = (r.sale_price !== null && r.sale_price !== undefined) ? r.sale_price : (r.unit_cost || 0);
        const qty = r.is_return ? -r.quantity : r.quantity;
        const rev = qty * price;
        let name = (r.product_name || r.product_code || (r.size && r.size !== 'Varios' ? r.size : null) || 'Ítem General').trim();
        if (name.length > 25) name = name.substring(0, 22) + '...';
        distRevenue[name] = parseFloat(((distRevenue[name] || 0) + rev).toFixed(2));
        distQty[name] = (distQty[name] || 0) + qty;
      });
      return Object.entries(distRevenue)
        .map(([name, revenue]) => ({ name, revenue, quantity: distQty[name] || 0 }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10);
    }`;

const newDistMemo = `    } else {
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

if (file.includes(oldDistMemo)) {
  file = file.replace(oldDistMemo, newDistMemo);
  console.log('1. productDistributionChartData memo updated with fullName');
} else {
  console.log('1. productDistributionChartData memo pattern not found');
}

// 2. Update Bar onClick handler to use fullName and cleanPrefix
const oldOnClick = `                        onClick={(entry: any) => {
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
                        }}`;

const newOnClick = `                        onClick={(entry: any) => {
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

if (file.includes(oldOnClick)) {
  file = file.replace(oldOnClick, newOnClick);
  console.log('2. Bar onClick handler updated with matching fix');
} else {
  console.log('2. Bar onClick handler pattern not found');
}

fs.writeFileSync('src/App.tsx', file.replace(/\n/g, '\r\n'), 'utf8');
