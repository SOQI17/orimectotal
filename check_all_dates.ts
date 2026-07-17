import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import path from "path";
import fs from "fs";

const serviceAccountPath = path.join("C:/Users/DESKTOPLM4-MD/Documents/IMPRESORAS_ORIMEC_APP/inventory-mana/serviceAccountKey.json");
if (!fs.existsSync(serviceAccountPath)) {
  console.error("serviceAccountKey.json not found");
  process.exit(1);
}

initializeApp({
  credential: cert(serviceAccountPath)
});

const db = getFirestore();

async function checkAllDates() {
  console.log("Querying all Firestore consumos...");
  const snapshot = await db.collection("consumos").get();
  console.log(`Found total ${snapshot.size} records in database.`);

  const monthGroups = {} as Record<string, { count: number; qty: number; revenue: number }>;

  snapshot.docs.forEach(doc => {
    const data = doc.data();
    const dateStr = data.order_date || "NO_DATE";
    const ym = dateStr.substring(0, 7); // e.g. "2026-01"
    
    if (!monthGroups[ym]) {
      monthGroups[ym] = { count: 0, qty: 0, revenue: 0 };
    }
    
    const qty = data.is_return ? -data.quantity : data.quantity;
    const price = (data.sale_price !== null && data.sale_price !== undefined) ? data.sale_price : (data.unit_cost || 0);

    monthGroups[ym].count += 1;
    monthGroups[ym].qty += qty;
    monthGroups[ym].revenue += qty * price;
  });

  console.log("\n--- Consolidated Totals by Month ---");
  Object.entries(monthGroups)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .forEach(([ym, stats]) => {
      console.log(`Month: ${ym} | Records: ${stats.count} | Total Qty: ${stats.qty} | Total Revenue: $${stats.revenue.toFixed(2)}`);
    });
}

checkAllDates().catch(err => {
  console.error("Error running script:", err);
});
