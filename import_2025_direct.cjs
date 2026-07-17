const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const path = require("path");
const fs = require("fs");

const serviceAccountPath = "C:/Users/DESKTOPLM4-MD/Documents/IMPRESORAS_ORIMEC_APP/inventory-mana/serviceAccountKey.json";
if (!fs.existsSync(serviceAccountPath)) {
  console.error("serviceAccountKey.json not found");
  process.exit(1);
}

initializeApp({
  credential: cert(serviceAccountPath)
});

const db = getFirestore();

// Normalizer and helper functions (matching App.tsx)
const norm = (s) => (s || '').toUpperCase().trim().replace(/\s+/g, ' ');
const normInvoice = (s) => (s || '').replace(/^0+/, '').trim();

const extractSizeFromArticulo = (articulo) => {
  if (!articulo) return '';
  const patterns = [
    /\b(35[xX×]43|35x43)\b/i,
    /\b(26[xX×]36|26x36)\b/i,
    /\b(25[xX×]30|25x30)\b/i,
    /\b(20[xX×]25|20x25)\b/i,
    /\b(14[xX×]17)\b/i,
    /\b(10[xX×]14)\b/i,
    /\b(10[xX×]12)\b/i,
    /\b(8[xX×]10)\b/i,
  ];
  const cmToInch = {
    '35X43': '14x17', '35x43': '14x17',
    '26X36': '10x14', '26x36': '10x14',
    '25X30': '10x12', '25x30': '10x12',
    '20X25': '8x10',  '20x25': '8x10',
  };
  for (const pat of patterns) {
    const m = articulo.match(pat);
    if (m) {
      const val = m[0].toUpperCase().replace('×', 'X');
      return cmToInch[val] || m[0].toLowerCase().replace('×', 'x');
    }
  }
  return '';
};

const extractClientInfoFromRow = (row, rowKeys) => {
  const getExact = (candidates) => {
    for (const c of candidates) {
      const key = rowKeys.find(k => norm(k) === norm(c));
      if (key && row[key] !== undefined && row[key] !== '') return String(row[key]).trim();
    }
    for (const c of candidates) {
      const key = rowKeys.find(k => norm(k).includes(norm(c)) || norm(c).includes(norm(k)));
      if (key && row[key] !== undefined && row[key] !== '') return String(row[key]).trim();
    }
    return '';
  };
  return {
    name: getExact(['cliente', 'client', 'nombre cliente', 'nombre', 'name']) || 'Sin nombre',
    province: getExact(['provincia', 'province', 'ciudad', 'city']) || '',
    clientCode: getExact(['cod cliente', 'codigo2', 'codigo cliente', 'código cliente', 'client_code', 'cod', 'codigo']) || '',
    salesperson: getExact(['vendedor', 'salesperson', 'asesor', 'representante']) || '',
  };
};

const parseNumber = (valStr) => {
  if (!valStr) return undefined;
  let cleaned = valStr.trim();
  
  // Excel Accounting Format: single hyphen represents 0
  if (cleaned === '-' || cleaned === '—' || cleaned === '–') {
    return 0;
  }
  
  cleaned = cleaned.replace(/\s/g, '');
  if (/\d\.\d{3},\d{2}/.test(cleaned)) {
    cleaned = cleaned.replace(/\./g, '').replace(',', '.');
  } else {
    if (cleaned.includes('.') && cleaned.includes(',')) {
      const dotIdx = cleaned.indexOf('.');
      const commaIdx = cleaned.indexOf(',');
      if (dotIdx < commaIdx) {
        cleaned = cleaned.replace(/\./g, '').replace(',', '.');
      } else {
        cleaned = cleaned.replace(/,/g, '');
      }
    } else {
      cleaned = cleaned.replace(',', '.');
    }
  }
  const parsed = parseFloat(cleaned);
  return (!isNaN(parsed)) ? parsed : undefined;
};

const findClientForRow = (row, rowKeys, allClients, altNames) => {
  const clientNameCols = ['cliente', 'client', 'nombre cliente', 'nombre_cliente', 'razón social', 'razon social', 'name', 'nombre'];
  const rucCols = ['ruc', 'ruc/id', 'ruc_id', 'cedula', 'identificacion'];
  const codeCols = ['cod cliente', 'codigo2', 'codigo cliente', 'código cliente', 'codcliente', 'client_code', 'client code', 'cod', 'codigo', 'código'];

  let clientNameVal = '';
  let rucVal = '';
  let codeVal = '';

  rowKeys.forEach(k => {
    const kn = norm(k);
    if (!codeVal) {
      if (codeCols.some(c => kn === norm(c))) codeVal = norm(row[k]);
      else if (codeCols.some(c => kn.includes(norm(c)))) codeVal = norm(row[k]);
    }
    if (!rucVal && rucCols.some(c => kn === norm(c))) rucVal = norm(row[k]);
    if (!clientNameVal && clientNameCols.some(c => kn === norm(c) || kn.includes(norm(c)))) clientNameVal = norm(row[k]);
  });

  if (codeVal) {
    const found = allClients.find(c =>
      norm(c.client_code) === codeVal ||
      (c.alt_codes || []).some(ac => norm(ac) === codeVal)
    );
    if (found) return found;
  }
  if (rucVal) {
    const found = allClients.find(c => norm(c.ruc_id) === rucVal);
    if (found) return found;
  }
  if (clientNameVal) {
    const found = allClients.find(c => norm(c.name) === clientNameVal || norm(altNames[c.id] || '') === clientNameVal);
    if (found) return found;
  }
  if (clientNameVal) {
    const found = allClients.find(c =>
      norm(c.name).includes(clientNameVal) ||
      clientNameVal.includes(norm(c.name)) ||
      (altNames[c.id] && (norm(altNames[c.id]).includes(clientNameVal) || clientNameVal.includes(norm(altNames[c.id]))))
    );
    if (found) return found;
  }
  return null;
};

const mapRowToRecord = (row, rowKeys, clientId, nextId) => {
  const get = (candidates) => {
    for (const c of candidates) {
      const key = rowKeys.find(k => norm(k) === norm(c));
      if (key && row[key] !== undefined && row[key] !== '') return String(row[key]);
    }
    for (const c of candidates) {
      const key = rowKeys.find(k => norm(k).includes(norm(c)));
      if (key && row[key] !== undefined && row[key] !== '') return String(row[key]);
    }
    return '';
  };

  const rawDate = get(['fecha pedido', 'fecha_pedido', 'order_date', 'fecha', 'date', 'fecha de pedido', 'fecha venta']);
  let orderDate = rawDate;
  if (rawDate) {
    const m1 = rawDate.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/);
    if (m1) {
      const [, d, mo, y] = m1;
      const year = y.length === 2 ? `20${y}` : y;
      orderDate = `${year}-${mo.padStart(2,'0')}-${d.padStart(2,'0')}`;
    }
    const m2 = rawDate.match(/^(\d{4})[\/\-](\d{2})[\/\-](\d{2})/);
    if (m2) orderDate = `${m2[1]}-${m2[2]}-${m2[3]}`;
  }

  const rawExpiry = get(['fecha expiración', 'fecha expiracion', 'expiry_date', 'vencimiento', 'expiry', 'fecha venc']);
  let expiryDate = '2099-12-31';
  if (rawExpiry) {
    const m1 = rawExpiry.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/);
    if (m1) {
      const [, d, mo, y] = m1;
      const year = y.length === 2 ? `20${y}` : y;
      expiryDate = `${year}-${mo.padStart(2,'0')}-${d.padStart(2,'0')}`;
    }
    const m2 = rawExpiry.match(/^(\d{4})[\/\-](\d{2})[\/\-](\d{2})/);
    if (m2) expiryDate = `${m2[1]}-${m2[2]}-${m2[3]}`;
  }

  let size = get(['medida', 'size', 'talla', 'formato', 'articulo medida']);
  if (!size) {
    const articulo = get(['articulo', 'producto', 'article', 'descripcion', 'description']);
    size = extractSizeFromArticulo(articulo);
  }

  const qtyRaw = get(['cantidad', 'quantity', 'qty', 'cajas', 'boxes']);
  const qtyParsed = (qtyRaw !== '' && !isNaN(parseInt(qtyRaw))) ? parseInt(qtyRaw) : 1;
  const isReturn = qtyParsed < 0;
  const qty = Math.abs(qtyParsed);

  const unitCostRaw = get(['costo', 'costo unitario', 'costo_unitario', 'unit_cost', 'c/u', 'precio unitario', 'valor unitario']);
  const totalCostRaw = get(['costo total', 'costo_total', 'total']);
  
  const uCost = parseNumber(unitCostRaw);
  const tCost = parseNumber(totalCostRaw);
  
  let finalCost = null;
  if (uCost !== undefined) {
    finalCost = Math.abs(uCost);
  } else if (tCost !== undefined) {
    finalCost = qty > 0 ? parseFloat((Math.abs(tCost) / qty).toFixed(4)) : Math.abs(tCost);
  }

  const unitPriceRaw = get(['precio', 'price', 'precio unitario', 'precio venta', 'pvp', 'valor venta']);
  const totalRevenueRaw = get(['vta total', 'venta total', 'venta_total', 'total venta', 'valor total venta', 'ingresos']);

  const uPrice = parseNumber(unitPriceRaw);
  const tRevenue = parseNumber(totalRevenueRaw);

  let finalSalePrice = null;
  if (uPrice !== undefined) {
    finalSalePrice = Math.abs(uPrice);
  } else if (tRevenue !== undefined) {
    finalSalePrice = qty > 0 ? parseFloat((Math.abs(tRevenue) / qty).toFixed(4)) : Math.abs(tRevenue);
  }

  const rawInvoice = get(['factura', 'invoice', 'invoice_number', 'n° factura', 'numero factura', 'nro factura', 'nro. factura']);
  
  const fixInvoiceNumber = (raw) => {
    if (!raw) return '';
    const s = raw.trim();
    if (/^[\d.,]+[eE][+\-]\d+$/.test(s)) {
      const normalized = s.replace(',', '.');
      const num = parseFloat(normalized);
      if (!isNaN(num)) return Math.round(num).toString();
    }
    return s;
  };
  const invoice = fixInvoiceNumber(rawInvoice);

  const articuloRaw = get(['articulo', 'producto', 'article', 'descripcion', 'description']);
  let filmType = undefined;
  const explicitFilmType = get(['film_type', 'tipo pelicula', 'tipo película', 'tipo de pelicula', 'tipo de película']);
  if (explicitFilmType) {
    filmType = norm(explicitFilmType);
  } else if (articuloRaw) {
    const a = articuloRaw.toUpperCase();
    if (a.includes('DI-HL') || a.includes('DIHL')) filmType = 'DIHL';
    else if (a.includes('DI-ML') || a.includes('DIML')) filmType = 'DIML';
    else if (a.includes('DI-HT') || a.includes('DIHT') || a.includes('DRY FILM')) filmType = 'DIHT';
  }

  return {
    id: nextId,
    client_id: clientId,
    order_date: orderDate,
    size,
    quantity: qty,
    unit_cost: finalCost,
    sale_price: finalSalePrice,
    is_return: isReturn,
    invoice_number: invoice,
    film_type: filmType || 'DIHT',
    batch_number: '',
    expiry_date: expiryDate
  };
};

async function run() {
  console.log("=== STARTING DIRECT 2025 DATA RE-IMPORT ===");

  // 1. Fetch existing clients
  console.log("Fetching existing clients...");
  const clientSnap = await db.collection("clientes").get();
  const allClients = [];
  clientSnap.forEach(doc => {
    allClients.push(doc.data());
  });
  console.log(`Loaded ${allClients.length} clients.`);

  // 2. Fetch existing altNames
  console.log("Fetching alternate client names...");
  const altNamesSnap = await db.collection("altNames").get();
  const altNames = {};
  altNamesSnap.forEach(doc => {
    altNames[doc.id] = doc.data().canonicalName;
  });
  console.log(`Loaded alternate names.`);

  // 3. Fetch existing consumos (to retain ID sequencing and perform duplicate checking against other years)
  console.log("Fetching existing consumos...");
  const consumosSnap = await db.collection("consumos").get();
  const allConsumos = [];
  consumosSnap.forEach(doc => {
    allConsumos.push(doc.data());
  });
  console.log(`Loaded ${allConsumos.length} existing consumos.`);

  // Define ID generators
  let nextRecordId = Math.max(0, ...allConsumos.map(r => r.id)) + 1;
  let nextClientId = Math.max(0, ...allClients.map(c => c.id)) + 1;
  console.log(`Next Client ID: ${nextClientId} | Next Record ID: ${nextRecordId}`);

  // 4. Parse CSV file
  console.log("Reading CSV venta 2025.csv...");
  const csvPath = 'C:\\Users\\DESKTOPLM4-MD\\Documents\\IMPRESORAS_ORIMEC_APP\\venta 2025.csv';
  const csvContent = fs.readFileSync(csvPath, 'latin1');
  const lines = csvContent.split('\n');

  const rawHeaders = lines[0].trim().split(';');
  const hasCategoriaCol = rawHeaders.some(k => k.trim().toUpperCase() === 'CATEGORIA');
  
  const allRows = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const cols = line.split(';');
    const row = {};
    rawHeaders.forEach((h, idx) => {
      row[h] = cols[idx];
    });
    allRows.push(row);
  }

  // Filter only category PELICULAS and only AÑO 2025
  const rows = allRows.filter(row => {
    const cat = Object.entries(row).find(([k]) => k.trim().toUpperCase() === 'CATEGORIA')?.[1] || '';
    const year = row['AÑO'] || row['A\u00d1O'] || '';
    if (hasCategoriaCol && String(cat).trim().toUpperCase() !== 'PELICULAS') return false;
    return String(year).trim() === '2025';
  });

  console.log(`Found ${rows.length} film rows for 2025 in the CSV.`);

  // 5. Match clients and generate records
  console.log("Matching clients and preparing import records...");
  const matched = [];
  const toCreateClients = new Map(); // norm(code) -> clientInfo
  const consumosToInsert = [];

  // Deduplicate logic for creating new clients in memory
  rows.forEach(row => {
    const info = extractClientInfoFromRow(row, rawHeaders);
    const normCode = norm(info.clientCode);
    const normName = norm(info.name);

    if (!normName || normName === 'SIN NOMBRE') return;

    let client = findClientForRow(row, rawHeaders, allClients, altNames);
    if (!client) {
      const key = normCode || normName;
      if (!toCreateClients.has(key)) {
        toCreateClients.set(key, {
          name: info.name,
          province: info.province,
          client_code: info.clientCode,
          salesperson: info.salesperson.toUpperCase().trim()
        });
      }
    }
  });

  // Write new clients to Firestore first
  if (toCreateClients.size > 0) {
    console.log(`Creating ${toCreateClients.size} new clients in Firestore...`);
    for (const [key, cInfo] of toCreateClients) {
      const newClient = {
        id: nextClientId,
        name: cInfo.name,
        province: cInfo.province,
        ruc_id: '',
        contact: '',
        client_code: cInfo.client_code,
        salesperson: cInfo.salesperson,
        printers: []
      };
      await db.collection("clientes").doc(nextClientId.toString()).set(newClient);
      allClients.push(newClient);
      nextClientId++;
    }
  }

  // Define duplicate detector (excluding 2025 records which we'll purge)
  const non2025Consumos = allConsumos.filter(r => !r.order_date.startsWith("2025-"));
  const tempConsumosInCsv = []; // to prevent double-inserting duplicates within the CSV itself

  const isExistingRecord = (tempRec, clientId) => {
    // Check against existing non-2025 database records
    const inDb = non2025Consumos.some(r => {
      if (r.invoice_number && tempRec.invoice_number) {
        const invMatch = normInvoice(r.invoice_number) === normInvoice(tempRec.invoice_number);
        if (invMatch && r.size === tempRec.size && Math.abs(r.quantity) === Math.abs(tempRec.quantity)) return true;
        if (normInvoice(r.invoice_number) !== normInvoice(tempRec.invoice_number)) return false;
      }
      if (clientId > 0 && r.client_id === clientId &&
          r.order_date === tempRec.order_date &&
          r.size === tempRec.size &&
          Math.abs(r.quantity) === Math.abs(tempRec.quantity)) {
        if (r.invoice_number && tempRec.invoice_number && normInvoice(r.invoice_number) !== normInvoice(tempRec.invoice_number)) return false;
        return true;
      }
      return false;
    });

    if (inDb) return true;

    // Check against newly mapped rows from this CSV to prevent duplicates
    const inCsv = tempConsumosInCsv.some(r => {
      if (r.invoice_number && tempRec.invoice_number) {
        const invMatch = normInvoice(r.invoice_number) === normInvoice(tempRec.invoice_number);
        if (invMatch && r.size === tempRec.size && Math.abs(r.quantity) === Math.abs(tempRec.quantity)) return true;
        if (normInvoice(r.invoice_number) !== normInvoice(tempRec.invoice_number)) return false;
      }
      if (clientId > 0 && r.client_id === clientId &&
          r.order_date === tempRec.order_date &&
          r.size === tempRec.size &&
          Math.abs(r.quantity) === Math.abs(tempRec.quantity)) {
        if (r.invoice_number && tempRec.invoice_number && normInvoice(r.invoice_number) !== normInvoice(tempRec.invoice_number)) return false;
        return true;
      }
      return false;
    });

    return inCsv;
  };

  rows.forEach(row => {
    const client = findClientForRow(row, rawHeaders, allClients, altNames);
    if (!client) {
      console.warn(`WARNING: Client could not be matched/created for row: ${JSON.stringify(row)}`);
      return;
    }

    const record = mapRowToRecord(row, rawHeaders, client.id, nextRecordId);
    
    // Check duplicates
    if (isExistingRecord(record, client.id)) {
      // Duplicate row, skip
      return;
    }

    // Assign unique ID and record it
    record.id = nextRecordId++;
    tempConsumosInCsv.push(record);
    consumosToInsert.push(record);
  });

  console.log(`Prepared ${consumosToInsert.length} unique consumption records to upload.`);

  // 6. Purge all 2025 consumos first
  console.log("Querying existing 2025 records to purge from Firestore...");
  const purgeSnap = await db.collection("consumos")
    .where("order_date", ">=", "2025-01-01")
    .where("order_date", "<=", "2025-12-31")
    .get();

  console.log(`Found ${purgeSnap.size} existing 2025 records to delete.`);
  if (purgeSnap.size > 0) {
    const deleteBatch = db.batch();
    purgeSnap.docs.forEach(doc => {
      deleteBatch.delete(doc.ref);
    });
    await deleteBatch.commit();
    console.log("Purge of 2025 records completed successfully.");
  }

  // 7. Insert the new 2025 records in batches of 400
  console.log("Uploading new records in batches...");
  let uploaded = 0;
  for (let i = 0; i < consumosToInsert.length; i += 400) {
    const chunk = consumosToInsert.slice(i, i + 400);
    const writeBatch = db.batch();
    
    chunk.forEach(rec => {
      // Filter out undefined fields to prevent Firestore errors
      const cleanRecord = Object.fromEntries(
        Object.entries(rec).filter(([, v]) => v !== undefined)
      );
      writeBatch.set(db.collection("consumos").doc(rec.id.toString()), cleanRecord);
    });

    await writeBatch.commit();
    uploaded += chunk.length;
    console.log(`Uploaded batch: ${uploaded}/${consumosToInsert.length} records.`);
  }

  console.log("=== RE-IMPORT FINISHED SUCCESSFULLY WITH ZERO ERRORS ===");
}

run().catch(err => {
  console.error("CRITICAL ERROR during direct re-import:", err);
});
