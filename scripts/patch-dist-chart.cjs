const fs = require('fs');

let file = fs.readFileSync('src/App.tsx', 'utf8').replace(/\r\n/g, '\n');

const oldBlock = `    } else {
      const distRevenue = {} as Record<string, number>;
      const distQty = {} as Record<string, number>;
      dated.forEach(r => {
        const price = (r.sale_price !== null && r.sale_price !== undefined) ? r.sale_price : (r.unit_cost || 0);
        const rev = r.quantity * price;
        const name = r.size || 'Varios';
        distRevenue[name] = parseFloat(((distRevenue[name] || 0) + rev).toFixed(2));
        distQty[name] = (distQty[name] || 0) + r.quantity;
      });
      return Object.entries(distRevenue)
        .map(([name, revenue]) => ({ name, revenue, quantity: distQty[name] || 0 }))
        .sort((a,b) => b.revenue - a.revenue)
        .slice(0, 10);
    }`;

const newBlock = `    } else {
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

if (file.includes(oldBlock)) {
  file = file.replace(oldBlock, newBlock);
  console.log('Product distribution chart calculation updated for non-films');
} else {
  console.log('Product distribution chart pattern not found');
}

fs.writeFileSync('src/App.tsx', file.replace(/\n/g, '\r\n'), 'utf8');
