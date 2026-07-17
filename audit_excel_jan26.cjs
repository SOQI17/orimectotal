const XLSX = require("xlsx");
const path = require("path");
const fs = require("fs");

const files = [
  "C:/Users/DESKTOPLM4-MD/Documents/IMPRESORAS_ORIMEC_APP/total2026.xlsx",
  "C:/Users/DESKTOPLM4-MD/Documents/IMPRESORAS_ORIMEC_APP/total2026arreglado.xlsx"
];

function norm(str) {
  return String(str || '').trim().toLowerCase()
    .replace(/\s+/g, '')
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

files.forEach(excelPath => {
  if (!fs.existsSync(excelPath)) return;
  const workbook = XLSX.readFile(excelPath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(sheet);
  
  let janRows = 0;
  let totalQty = 0;
  let totalRevenue = 0;
  let totalCost = 0;

  rows.forEach(row => {
    // Check CATEGORIA
    const cat = row["CATEGORIA"] || "";
    if (norm(cat) !== "peliculas") return;

    // Check year and month
    const year = String(row["AÑO"] || "");
    const month = String(row["MES"] || "");
    
    // We want year 2026 and month "Ene" (case-insensitive normalized)
    const isJanuary2026 = year === "2026" && norm(month) === "ene";
    if (!isJanuary2026) return;

    janRows++;
    const qty = parseInt(row["CANTIDAD"] || row["CANT"]) || 0;
    const vtaTotal = parseFloat(row["VTA TOTAL"]) || 0;
    const costoTotal = parseFloat(row["COSTO TOTAL"]) || 0;

    totalQty += qty;
    totalRevenue += vtaTotal;
    totalCost += costoTotal;
  });

  console.log(`\n=== File: ${path.basename(excelPath)} ===`);
  console.log(`January 2026 Rows Count: ${janRows}`);
  console.log(`Sum of CANTIDAD: ${totalQty}`);
  console.log(`Sum of VTA TOTAL (Revenue): $${totalRevenue.toFixed(2)}`);
  console.log(`Sum of COSTO TOTAL (Cost): $${totalCost.toFixed(2)}`);
});
