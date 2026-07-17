const fs = require('fs');
const XLSX = require('xlsx');

const filePath = 'C:/Users/DESKTOPLM4-MD/Documents/IMPRESORAS_ORIMEC_APP/ventaxprod2025.xlsx';
const workbook = XLSX.readFile(filePath);
const sheet = workbook.Sheets['ventas'];
const rows = XLSX.utils.sheet_to_json(sheet);

console.log("ROW_IDX,CLIENT,PRODUCTO,CATEGORY,QTY,COST_TOTAL,VTA_TOTAL");
rows.forEach((row, idx) => {
  const year = row['AÑO'] || row['Año'] || row['año'] || '';
  const month = row['MES'] || row['Mes'] || row['mes'] || '';
  const cat = row['CATEGORIA'] || row['Categoria'] || row['categoria'] || '';
  
  const isOct2025 = String(year) === '2025' && String(month) === '10';
  
  if (isOct2025) {
    if (cat.toUpperCase().trim() !== 'PELICULAS') {
      console.log(`${idx + 2},${row['CLIENTE']},${row['ARTICULO']},${cat},${row['CANTIDAD']},${row['COSTO TOTAL']},${row['VTA TOTAL']}`);
    }
  }
});
