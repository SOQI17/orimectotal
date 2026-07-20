const fs = require('fs');

let file = fs.readFileSync('src/App.tsx', 'utf8').replace(/\r\n/g, '\n');

// 1. Update batch update loop in DIHL-only branch
const oldUpdate1 = `            const updateData: any = { film_type: 'DIHL' };
            if (record.unit_cost !== undefined) updateData.unit_cost = record.unit_cost;
            if (record.batch_number !== undefined && record.batch_number !== '') updateData.batch_number = record.batch_number;
            if (record.expiry_date !== undefined && record.expiry_date !== '2099-12-31') updateData.expiry_date = record.expiry_date;
            if (record.order_date !== undefined) updateData.order_date = record.order_date;`;

const newUpdate1 = `            const updateData: any = { film_type: 'DIHL' };
            if (record.unit_cost !== undefined) updateData.unit_cost = record.unit_cost;
            if (record.batch_number !== undefined && record.batch_number !== '') updateData.batch_number = record.batch_number;
            if (record.expiry_date !== undefined && record.expiry_date !== '2099-12-31') updateData.expiry_date = record.expiry_date;
            if (record.order_date !== undefined) updateData.order_date = record.order_date;
            if (record.product_code !== undefined) updateData.product_code = record.product_code;
            if (record.product_name !== undefined) updateData.product_name = record.product_name;
            if (record.categoria !== undefined) updateData.categoria = record.categoria;`;

if (file.includes(oldUpdate1)) {
  file = file.replace(oldUpdate1, newUpdate1);
  console.log('Update 1 replaced successfully');
} else {
  console.log('Update 1 pattern not found');
}

// 2. Update batch update loop in standard CSV import
const oldUpdate2 = `          const updateData: any = {};
          if (record.unit_cost !== undefined) updateData.unit_cost = record.unit_cost;
          if (record.batch_number !== undefined && record.batch_number !== '') updateData.batch_number = record.batch_number;
          if (record.expiry_date !== undefined && record.expiry_date !== '2099-12-31') updateData.expiry_date = record.expiry_date;
          if (record.film_type !== undefined && record.film_type !== '') updateData.film_type = record.film_type;
          if (record.order_date !== undefined) updateData.order_date = record.order_date;`;

const newUpdate2 = `          const updateData: any = {};
          if (record.unit_cost !== undefined) updateData.unit_cost = record.unit_cost;
          if (record.batch_number !== undefined && record.batch_number !== '') updateData.batch_number = record.batch_number;
          if (record.expiry_date !== undefined && record.expiry_date !== '2099-12-31') updateData.expiry_date = record.expiry_date;
          if (record.film_type !== undefined && record.film_type !== '') updateData.film_type = record.film_type;
          if (record.order_date !== undefined) updateData.order_date = record.order_date;
          if (record.product_code !== undefined) updateData.product_code = record.product_code;
          if (record.product_name !== undefined) updateData.product_name = record.product_name;
          if (record.categoria !== undefined) updateData.categoria = record.categoria;`;

if (file.includes(oldUpdate2)) {
  file = file.replace(oldUpdate2, newUpdate2);
  console.log('Update 2 replaced successfully');
} else {
  console.log('Update 2 pattern not found');
}

fs.writeFileSync('src/App.tsx', file.replace(/\n/g, '\r\n'), 'utf8');
