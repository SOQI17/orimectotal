const fs = require('fs');

let file = fs.readFileSync('src/App.tsx', 'utf8');

file = file.replace(
  '<span className="text-emerald-500 text-xs font-mono font-bold">${clientMetrics.total.toLocaleString()}</span>',
  '<span className="text-emerald-500 text-xs font-mono font-bold">${clientMonthlyRevenue.reduce((acc, item) => acc + item.total, 0).toLocaleString()}</span>'
);

fs.writeFileSync('src/App.tsx', file, 'utf8');
console.log('Fixed clientMetrics variable name');
