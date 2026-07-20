const fs = require('fs');

let file = fs.readFileSync('src/App.tsx', 'utf8');

file = file.replace(
  '}).filter(Boolean).sort((a, b) => (b!.quantity) - (a!.quantity)) as any[];',
  '}).filter(Boolean).sort((a, b) => (b!.revenue) - (a!.revenue)) as any[];'
);

fs.writeFileSync('src/App.tsx', file, 'utf8');
console.log('Salesperson performance sort updated to revenue descending');
