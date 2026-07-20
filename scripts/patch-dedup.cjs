const fs = require('fs');

let file = fs.readFileSync('src/App.tsx', 'utf8').replace(/\r\n/g, '\n');

// Update consumosByInvoiceKey and consumosByClientKey population
const oldPopulate = `          allConsumos.forEach(r => {
            if (r.invoice_number) {
              const invKey = \`\${normInvoice(r.invoice_number)}|\${r.size}|\${Math.abs(r.quantity)}\`;
              if (!consumosByInvoiceKey.has(invKey)) consumosByInvoiceKey.set(invKey, r);
            }
            if (r.client_id > 0) {
              const clientKey = \`\${r.client_id}|\${r.order_date}|\${r.size}|\${Math.abs(r.quantity)}\`;
              if (!consumosByClientKey.has(clientKey)) consumosByClientKey.set(clientKey, r);
            }
          });`;

const newPopulate = `          allConsumos.forEach(r => {
            if (r.invoice_number) {
              const invKeyExact = \`\${normInvoice(r.invoice_number)}|\${r.size}|\${Math.abs(r.quantity)}\`;
              const invKeyNoSize = \`\${normInvoice(r.invoice_number)}|\${Math.abs(r.quantity)}\`;
              const invKeyInvoiceOnly = \`\${normInvoice(r.invoice_number)}\`;
              if (!consumosByInvoiceKey.has(invKeyExact)) consumosByInvoiceKey.set(invKeyExact, r);
              if (!consumosByInvoiceKey.has(invKeyNoSize)) consumosByInvoiceKey.set(invKeyNoSize, r);
              if (!consumosByInvoiceKey.has(invKeyInvoiceOnly)) consumosByInvoiceKey.set(invKeyInvoiceOnly, r);
            }
            if (r.client_id > 0) {
              const clientKeyExact = \`\${r.client_id}|\${r.order_date}|\${r.size}|\${Math.abs(r.quantity)}\`;
              const clientKeyNoSize = \`\${r.client_id}|\${r.order_date}|\${Math.abs(r.quantity)}\`;
              if (!consumosByClientKey.has(clientKeyExact)) consumosByClientKey.set(clientKeyExact, r);
              if (!consumosByClientKey.has(clientKeyNoSize)) consumosByClientKey.set(clientKeyNoSize, r);
            }
          });`;

if (file.includes(oldPopulate)) {
  file = file.replace(oldPopulate, newPopulate);
  console.log('Populate maps updated successfully');
} else {
  console.log('Populate maps pattern not found');
}

// Update getExistingRecordFast
const oldFast = `          const getExistingRecordFast = (tempRec: any, clientId: number): ConsumptionRecord | undefined => {
            if (tempRec.invoice_number) {
              const invKey = \`\${normInvoice(tempRec.invoice_number)}|\${tempRec.size}|\${Math.abs(tempRec.quantity)}\`;
              const found = consumosByInvoiceKey.get(invKey);
              if (found) return found;
            }
            if (clientId > 0) {
              const clientKey = \`\${clientId}|\${tempRec.order_date}|\${tempRec.size}|\${Math.abs(tempRec.quantity)}\`;
              const found = consumosByClientKey.get(clientKey);
              if (found) {
                if (!found.invoice_number || !tempRec.invoice_number || normInvoice(found.invoice_number) === normInvoice(tempRec.invoice_number)) {
                  return found;
                }
              }
            }
            return undefined;
          };`;

const newFast = `          const getExistingRecordFast = (tempRec: any, clientId: number): ConsumptionRecord | undefined => {
            if (tempRec.invoice_number) {
              const invKeyExact = \`\${normInvoice(tempRec.invoice_number)}|\${tempRec.size}|\${Math.abs(tempRec.quantity)}\`;
              const invKeyNoSize = \`\${normInvoice(tempRec.invoice_number)}|\${Math.abs(tempRec.quantity)}\`;
              const invKeyInvoiceOnly = \`\${normInvoice(tempRec.invoice_number)}\`;
              const found = consumosByInvoiceKey.get(invKeyExact) || consumosByInvoiceKey.get(invKeyNoSize) || consumosByInvoiceKey.get(invKeyInvoiceOnly);
              if (found) return found;
            }
            if (clientId > 0) {
              const clientKeyExact = \`\${clientId}|\${tempRec.order_date}|\${tempRec.size}|\${Math.abs(tempRec.quantity)}\`;
              const clientKeyNoSize = \`\${clientId}|\${tempRec.order_date}|\${Math.abs(tempRec.quantity)}\`;
              const found = consumosByClientKey.get(clientKeyExact) || consumosByClientKey.get(clientKeyNoSize);
              if (found) {
                if (!found.invoice_number || !tempRec.invoice_number || normInvoice(found.invoice_number) === normInvoice(tempRec.invoice_number)) {
                  return found;
                }
              }
            }
            return undefined;
          };`;

if (file.includes(oldFast)) {
  file = file.replace(oldFast, newFast);
  console.log('getExistingRecordFast updated successfully');
} else {
  console.log('getExistingRecordFast pattern not found');
}

fs.writeFileSync('src/App.tsx', file.replace(/\n/g, '\r\n'), 'utf8');
