import * as XLSX from "xlsx";
import path from "path";
import fs from "fs";

const excelPath = "C:/Users/DESKTOPLM4-MD/Documents/IMPRESORAS_ORIMEC_APP/Base x Cleinte x peliculas 02-2026.xlsx";
if (!fs.existsSync(excelPath)) {
  console.error("Excel file not found");
  process.exit(1);
}

function norm(str: any) {
  return String(str || '').trim().toLowerCase()
    .replace(/\s+/g, '')
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

async function auditExcel() {
  console.log("Reading Excel file:", excelPath);
  const workbook = XLSX.readFile(excelPath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(sheet);

  console.log(`Excel sheet has ${rows.length} total rows.`);

  let januaryRowsCount = 0;
  let totalJanuaryCajas = 0;
  let totalJanuaryRevenue = 0;
  let totalJanuaryCost = 0;

  const groupedByFactura = {} as Record<string, any[]>;

  rows.forEach((row: any, index) => {
    // Check CATEGORIA
    const cat = row["CATEGORIA"] || "";
    if (norm(cat) !== "peliculas") return;

    // Check year and month
    const year = String(row["AÑO"] || "");
    const month = String(row["MES"] || ""); // "Ene" or "Enero" or similar
    
    // We want year 2026 and month "Ene"
    const isJanuary2026 = year === "2026" && (norm(month) === "ene" || norm(month) === "enero");
    if (!isJanuary2026) return;

    januaryRowsCount++;
    const qty = parseInt(row["CANT"]) || 0;
    const vtaTotal = parseFloat(row["VTA TOTAL"]) || 0;
    const costoTotal = parseFloat(row["COSTO TOTAL"]) || 0;

    totalJanuaryCajas += qty;
    totalJanuaryRevenue += vtaTotal;
    totalJanuaryCost += costoTotal;

    const fact = String(row["FACTURA"] || "S/F").trim();
    if (!groupedByFactura[fact]) {
      groupedByFactura[fact] = [];
    }
    groupedByFactura[fact].push({ index, row });
  });

  console.log("\n--- January 2026 Excel Row Audits ---");
  console.log(`January 2026 Rows Count: ${januaryRowsCount}`);
  console.log(`Sum of CANT: ${totalJanuaryCajas}`);
  console.log(`Sum of VTA TOTAL: $${totalJanuaryRevenue.toFixed(2)}`);
  console.log(`Sum of COSTO TOTAL: $${totalJanuaryCost.toFixed(2)}`);

  console.log("\nTop 5 invoices in January 2026 Excel:");
  Object.entries(groupedByFactura)
    .slice(0, 5)
    .forEach(([fact, list]) => {
      console.log(`Factura: ${fact} | Rows: ${list.length} | Cajas: ${list.reduce((sum, item) => sum + (parseInt(item.row["CANT"]) || 0), 0)}`);
    });
}

auditExcel().catch(err => {
  console.error("Error:", err);
});
