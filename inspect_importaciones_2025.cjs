const fs = require('fs');
const XLSX = require('xlsx');

const filePath = 'C:/Users/DESKTOPLM4-MD/Documents/IMPRESORAS_ORIMEC_APP/importaciones 2025 depurado FJ.xlsx';
if (!fs.existsSync(filePath)) {
  console.log("File not found:", filePath);
  process.exit(1);
}

const workbook = XLSX.readFile(filePath);
let totalQty = 0;
let totalCost = 0;
let totalRev = 0;

workbook.SheetNames.forEach(sheetName => {
  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(sheet);
  
  rows.forEach(row => {
    const dateVal = row['FECHA'] || row['Fecha'] || row['fecha'] || '';
    if (!dateVal) return;
    
    let dateObj;
    if (typeof dateVal === 'number') {
      dateObj = new Date(Math.round((dateVal - 25569) * 86400 * 1000));
    } else {
      dateObj = new Date(dateVal);
    }
    
    if (isNaN(dateObj.getTime())) return;
    
    const y = dateObj.getFullYear();
    const m = dateObj.getMonth() + 1;
    
    if (y === 2025 && m === 10) {
      const qty = parseInt(row['CANTIDAD'] || row['Cantidad'] || '0') || 0;
      totalQty += qty;
      totalCost += parseFloat(row['COSTO TOTAL'] || row['Costo Total'] || '0') || 0;
      totalRev += parseFloat(row['VENTA TOTAL'] || row['Venta Total'] || '0') || 0;
      console.log(`Sheet: ${sheetName} | Date: ${dateObj.toISOString().split('T')[0]} | Client: ${row['CLIENTE']} | Qty: ${qty} | Cost: ${row['COSTO TOTAL']}`);
    }
  });
});

console.log(`GRAND TOTALS in importaciones 2025: Qty=${totalQty}, Cost=${totalCost.toFixed(2)}, Rev=${totalRev.toFixed(2)}`);
