const fs = require('fs');

let file = fs.readFileSync('src/App.tsx', 'utf8').replace(/\r\n/g, '\n');

const oldChunk = `          const consumosByInvoiceKey = new Map<string, ConsumptionRecord>();
          const consumosByClientKey = new Map<string, ConsumptionRecord>();

          allConsumos.forEach(r => {
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

const newChunk = `          const consumosByInvoice = new Map<string, ConsumptionRecord[]>();
          const consumosByClient = new Map<number, ConsumptionRecord[]>();

          allConsumos.forEach(r => {
            if (r.invoice_number) {
              const invKey = normInvoice(r.invoice_number);
              if (!consumosByInvoice.has(invKey)) consumosByInvoice.set(invKey, []);
              consumosByInvoice.get(invKey)!.push(r);
            }
            if (r.client_id > 0) {
              if (!consumosByClient.has(r.client_id)) consumosByClient.set(r.client_id, []);
              consumosByClient.get(r.client_id)!.push(r);
            }
          });`;

if (file.includes(oldChunk)) {
  file = file.replace(oldChunk, newChunk);
  console.log('Array maps population updated');
} else {
  console.log('Array maps population pattern not found');
}

const oldFastFunc = `          const getExistingRecordFast = (tempRec: any, clientId: number): ConsumptionRecord | undefined => {
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

const newFastFunc = `          const usedExistingRecordIds = new Set<number>();
          const getExistingRecordFast = (tempRec: any, clientId: number): ConsumptionRecord | undefined => {
            const normInv = tempRec.invoice_number ? normInvoice(tempRec.invoice_number) : '';
            if (normInv && consumosByInvoice.has(normInv)) {
              const candidates = consumosByInvoice.get(normInv)!;
              let match = candidates.find(r => 
                !usedExistingRecordIds.has(r.id) &&
                ((tempRec.product_code && r.product_code === tempRec.product_code) ||
                 (tempRec.product_name && r.product_name === tempRec.product_name) ||
                 (tempRec.size && r.size === tempRec.size))
              );
              if (!match) {
                match = candidates.find(r => !usedExistingRecordIds.has(r.id) && Math.abs(r.quantity) === Math.abs(tempRec.quantity));
              }
              if (!match) {
                match = candidates.find(r => !usedExistingRecordIds.has(r.id));
              }
              if (match) {
                usedExistingRecordIds.add(match.id);
                return match;
              }
            }
            if (clientId > 0 && consumosByClient.has(clientId)) {
              const candidates = consumosByClient.get(clientId)!;
              const match = candidates.find(r => 
                !usedExistingRecordIds.has(r.id) &&
                r.order_date === tempRec.order_date &&
                Math.abs(r.quantity) === Math.abs(tempRec.quantity)
              );
              if (match) {
                usedExistingRecordIds.add(match.id);
                return match;
              }
            }
            return undefined;
          };`;

if (file.includes(oldFastFunc)) {
  file = file.replace(oldFastFunc, newFastFunc);
  console.log('getExistingRecordFast func updated');
} else {
  console.log('getExistingRecordFast func pattern not found');
}

// Update diff checks to include product_code and product_name
file = file.replace(
  `                  (tempRecord.unit_cost !== undefined && tempRecord.unit_cost !== existingRec.unit_cost) ||`,
  `                  (tempRecord.product_code !== undefined && tempRecord.product_code !== existingRec.product_code) ||\n                  (tempRecord.product_name !== undefined && tempRecord.product_name !== existingRec.product_name) ||\n                  (tempRecord.unit_cost !== undefined && tempRecord.unit_cost !== existingRec.unit_cost) ||`
);

file = file.replace(
  `                (tempRecord2.unit_cost !== undefined && tempRecord2.unit_cost !== existingRec2.unit_cost) ||`,
  `                (tempRecord2.product_code !== undefined && tempRecord2.product_code !== existingRec2.product_code) ||\n                (tempRecord2.product_name !== undefined && tempRecord2.product_name !== existingRec2.product_name) ||\n                (tempRecord2.unit_cost !== undefined && tempRecord2.unit_cost !== existingRec2.unit_cost) ||`
);

fs.writeFileSync('src/App.tsx', file.replace(/\n/g, '\r\n'), 'utf8');
