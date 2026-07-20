const fs = require('fs');

let file = fs.readFileSync('src/App.tsx', 'utf8').replace(/\r\n/g, '\n');

const oldCode = `  if (activeCategory && activeCategory !== 'PELICULAS' && activeCategory !== 'ALL') {
    const productMap: Record<string, { qty: number; costoTotal: number; ventaTotal: number; code?: string }> = {};`;

const newCode = `  if (activeCategory && activeCategory !== 'PELICULAS' && activeCategory !== 'ALL') {
    const effectiveQty = (r: any) => (r.is_return ? -r.quantity : r.quantity);
    const productMap: Record<string, { qty: number; costoTotal: number; ventaTotal: number; code?: string }> = {};`;

if (file.includes(oldCode)) {
  file = file.replace(oldCode, newCode);
  console.log('effectiveQty added to PurchasesDashboardView scope');
} else {
  console.log('Code pattern not found');
}

fs.writeFileSync('src/App.tsx', file.replace(/\n/g, '\r\n'), 'utf8');
