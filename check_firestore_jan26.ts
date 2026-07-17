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

async function checkJan2026() {
  console.log("Querying Firestore consumos for January 2026...");
  const snapshot = await db.collection("consumos")
    .where("order_date", ">=", "2026-01-01")
    .where("order_date", "<=", "2026-01-31")
    .get();

  console.log(`Found ${snapshot.size} records in January 2026.`);
  
  let totalQty = 0;
  let totalRevenue = 0;
  
  snapshot.docs.forEach(doc => {
    const data = doc.data();
    const qty = data.is_return ? -data.quantity : data.quantity;
    const price = (data.sale_price !== null && data.sale_price !== undefined) ? data.sale_price : (data.unit_cost || 0);
    
    totalQty += qty;
    totalRevenue += qty * price;
    
    console.log(`ID: ${doc.id} | Date: ${data.order_date} | Client ID: ${data.client_id} | Size: ${data.size} | Qty: ${qty} | Price: ${price} | Cost: ${data.unit_cost}`);
  });

  console.log("\n--- Consolidated Totals ---");
  console.log(`Total Cajas (Quantity): ${totalQty}`);
  console.log(`Total Revenue (Venta): $${totalRevenue.toFixed(2)}`);
}

checkJan2026().catch(err => {
  console.error("Error running script:", err);
});
