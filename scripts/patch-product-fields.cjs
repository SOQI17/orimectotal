const fs = require('fs');

let file = fs.readFileSync('src/App.tsx', 'utf8');

// Normalize CRLF to LF
file = file.replace(/\r\n/g, '\n');

// 1. Update ConsumptionRecord interface to add product_code and product_name
const oldInterface = `interface ConsumptionRecord {
  id: number;
  client_id: number;
  order_date: string;
  invoice_number?: string;
  quantity: number;
  size: string;
  batch_number: string;
  expiry_date: string;
  unit_cost?: number;
  sale_price?: number;   // precio de venta al cliente (columna PRECIO del CSV)
  film_type?: 'DIHT' | 'DIHL' | string;
  is_return?: boolean;
  adapted_to?: string;
  adapted_ratio?: number;
  // Nota de Crédito
  nc_type?: 'devolucion' | 'anulacion'; // tipo de NC
  nc_number?: string;                    // número de la NC
  nc_invoice_ref?: string;               // factura original que anula
  nc_new_invoice?: string;               // nueva factura (para anulación+refacturación)
  nc_reason?: string;                    // motivo
  categoria?: string;                    // linea o categoria del producto
}`;

const newInterface = `interface ConsumptionRecord {
  id: number;
  client_id: number;
  order_date: string;
  invoice_number?: string;
  quantity: number;
  size: string;
  batch_number: string;
  expiry_date: string;
  unit_cost?: number;
  sale_price?: number;   // precio de venta al cliente (columna PRECIO del CSV)
  film_type?: 'DIHT' | 'DIHL' | string;
  is_return?: boolean;
  adapted_to?: string;
  adapted_ratio?: number;
  // Nota de Crédito
  nc_type?: 'devolucion' | 'anulacion'; // tipo de NC
  nc_number?: string;                    // número de la NC
  nc_invoice_ref?: string;               // factura original que anula
  nc_new_invoice?: string;               // nueva factura (para anulación+refacturación)
  nc_reason?: string;                    // motivo
  categoria?: string;                    // linea o categoria del producto
  product_code?: string;                 // Código del producto/repuesto (ej: GE5260436, GELU42617)
  product_name?: string;                 // Nombre/descripción del producto (ej: PSD DR 45 SPARE PART)
}`;

if (file.includes(oldInterface)) {
  file = file.replace(oldInterface, newInterface);
  console.log('1. Interface ConsumptionRecord updated successfully');
} else {
  console.log('1. Interface pattern not found');
}

// 2. Update mapRowToRecord to extract product_code and product_name
const oldMapRowSize = `    // Size: try explicit column first, then extract from ARTICULO
    let size = get(['medida', 'size', 'talla', 'formato', 'articulo medida']);
    if (!size) {
      const articulo = get(['articulo', 'producto', 'article', 'descripcion', 'description']);
      size = extractSizeFromArticulo(articulo);
    }`;

const newMapRowSize = `    // Product Code & Product Name
    const productCode = get(['codigo', 'código', 'cod', 'cod_producto', 'codigo_producto', 'item_code', 'part_number', 'ref', 'referencia']);
    const productName = get(['producto', 'articulo', 'artículo', 'descripcion', 'descripción', 'description', 'nombre_producto', 'nombre']);

    // Size: try explicit column first, then extract from ARTICULO/PRODUCTO, or fallback to productName
    let size = get(['medida', 'size', 'talla', 'formato', 'articulo medida']);
    if (!size) {
      size = extractSizeFromArticulo(productName) || productName || '';
    }`;

if (file.includes(oldMapRowSize)) {
  file = file.replace(oldMapRowSize, newMapRowSize);
  console.log('2. mapRowToRecord extraction updated successfully');
} else {
  console.log('2. mapRowToRecord extraction pattern not found');
}

// 3. Update mapRowToRecord return object
const oldMapRowReturn = `      film_type: filmType || 'DIHT',
      is_return: isReturn || false,
      categoria: categoria,
    };`;

const newMapRowReturn = `      film_type: filmType || 'DIHT',
      is_return: isReturn || false,
      categoria: categoria,
      product_code: productCode || undefined,
      product_name: productName || undefined,
    };`;

if (file.includes(oldMapRowReturn)) {
  file = file.replace(oldMapRowReturn, newMapRowReturn);
  console.log('3. mapRowToRecord return object updated successfully');
} else {
  console.log('3. mapRowToRecord return object pattern not found');
}

// 4. Update Client Detail Table Headers
const oldHeaders = `                          <tr>
                            <th className="px-6 py-3 whitespace-nowrap">Fecha Pedido</th>
                            <th className="px-6 py-3 whitespace-nowrap">Factura</th>
                            <th className="px-6 py-3 whitespace-nowrap">{activeCategory === 'PELICULAS' ? 'Medida' : 'Descripción'}</th>
                            <th className="px-6 py-3 whitespace-nowrap">{activeCategory === 'PELICULAS' ? 'Tipo' : 'Línea'}</th>
                            <th className="px-6 py-3 text-center whitespace-nowrap">Cantidad</th>
                            {activeCategory === 'PELICULAS' && <th className="px-6 py-3 text-center whitespace-nowrap">m²</th>}
                            <th className="px-6 py-3 text-right whitespace-nowrap">Costo Unit.</th>
                            <th className="px-6 py-3 text-right whitespace-nowrap">Precio Venta</th>
                            <th className="px-6 py-3 text-right whitespace-nowrap">Total Venta</th>
                            <th className="px-6 py-3 whitespace-nowrap">Lote</th>
                            <th className="px-6 py-3 text-right whitespace-nowrap">Acciones</th>
                          </tr>`;

const newHeaders = `                          <tr>
                            <th className="px-6 py-3 whitespace-nowrap">Fecha Pedido</th>
                            <th className="px-6 py-3 whitespace-nowrap">Factura</th>
                            {activeCategory !== 'PELICULAS' && <th className="px-6 py-3 whitespace-nowrap">Código</th>}
                            <th className="px-6 py-3 whitespace-nowrap">{activeCategory === 'PELICULAS' ? 'Medida' : 'Producto / Descripción'}</th>
                            <th className="px-6 py-3 whitespace-nowrap">{activeCategory === 'PELICULAS' ? 'Tipo' : 'Línea'}</th>
                            <th className="px-6 py-3 text-center whitespace-nowrap">{activeCategory === 'PELICULAS' ? 'Cajas' : 'Cantidad'}</th>
                            {activeCategory === 'PELICULAS' && <th className="px-6 py-3 text-center whitespace-nowrap">m²</th>}
                            <th className="px-6 py-3 text-right whitespace-nowrap">Costo Unit.</th>
                            <th className="px-6 py-3 text-right whitespace-nowrap">Precio Venta</th>
                            <th className="px-6 py-3 text-right whitespace-nowrap">Total Venta</th>
                            <th className="px-6 py-3 whitespace-nowrap">Lote</th>
                            <th className="px-6 py-3 text-right whitespace-nowrap">Acciones</th>
                          </tr>`;

if (file.includes(oldHeaders)) {
  file = file.replace(oldHeaders, newHeaders);
  console.log('4. Client Detail table headers updated successfully');
} else {
  console.log('4. Client Detail table headers pattern not found');
}

// 5. Update Client Detail Table Cells
const oldRowCells = `                              <td className="px-6 py-3.5 font-medium text-xs whitespace-nowrap">{formattedDate}</td>
                              <td className={cn("px-6 py-3.5 text-xs whitespace-nowrap font-mono", darkMode ? "text-gray-500" : "text-gray-400")}>{record.invoice_number || '—'}</td>
                              <td className="px-6 py-3.5 whitespace-nowrap">
                                {activeCategory === 'PELICULAS' ? (
                                  <span className={cn("px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wide", darkMode ? "bg-white/12 text-gray-200" : "bg-gray-800 text-white")}>
                                    {record.size || '—'}
                                  </span>
                                ) : (
                                  <span className={cn("text-xs font-medium", darkMode ? "text-gray-300" : "text-gray-700")}>
                                    {record.size || '—'}
                                  </span>
                                )}
                              </td>`;

const newRowCells = `                              <td className="px-6 py-3.5 font-medium text-xs whitespace-nowrap">{formattedDate}</td>
                              <td className={cn("px-6 py-3.5 text-xs whitespace-nowrap font-mono", darkMode ? "text-gray-500" : "text-gray-400")}>{record.invoice_number || '—'}</td>
                              {activeCategory !== 'PELICULAS' && (
                                <td className={cn("px-6 py-3.5 text-xs font-mono whitespace-nowrap font-bold", darkMode ? "text-cyan-400" : "text-cyan-700")}>
                                  {record.product_code || (record as any).codigo || '—'}
                                </td>
                              )}
                              <td className="px-6 py-3.5 whitespace-nowrap">
                                {activeCategory === 'PELICULAS' ? (
                                  <span className={cn("px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wide", darkMode ? "bg-white/12 text-gray-200" : "bg-gray-800 text-white")}>
                                    {record.size || '—'}
                                  </span>
                                ) : (
                                  <span className={cn("text-xs font-semibold max-w-[280px] truncate block", darkMode ? "text-gray-200" : "text-gray-800")} title={record.product_name || record.size || ''}>
                                    {record.product_name || record.size || '—'}
                                  </span>
                                )}
                              </td>`;

if (file.includes(oldRowCells)) {
  file = file.replace(oldRowCells, newRowCells);
  console.log('5. Client Detail table cells updated successfully');
} else {
  console.log('5. Client Detail table cells pattern not found');
}

// 6. Update CSV Import Preview (matched records table)
const oldCsvMatchedHeaders = `<th className="px-4 py-2 font-bold uppercase text-[9px] tracking-wide">Cliente detectado</th>
                                <th className="px-4 py-2 font-bold uppercase text-[9px] tracking-wide">Fecha</th>
                                <th className="px-4 py-2 font-bold uppercase text-[9px] tracking-wide">Medida</th>
                                <th className="px-4 py-2 font-bold uppercase text-[9px] tracking-wide text-center">Cajas</th>
                                <th className="px-4 py-2 font-bold uppercase text-[9px] tracking-wide">Factura</th>`;

const newCsvMatchedHeaders = `<th className="px-4 py-2 font-bold uppercase text-[9px] tracking-wide">Cliente detectado</th>
                                <th className="px-4 py-2 font-bold uppercase text-[9px] tracking-wide">Fecha</th>
                                <th className="px-4 py-2 font-bold uppercase text-[9px] tracking-wide">Cód.</th>
                                <th className="px-4 py-2 font-bold uppercase text-[9px] tracking-wide">Producto / Descripción</th>
                                <th className="px-4 py-2 font-bold uppercase text-[9px] tracking-wide">Línea</th>
                                <th className="px-4 py-2 font-bold uppercase text-[9px] tracking-wide text-center">Cant.</th>
                                <th className="px-4 py-2 font-bold uppercase text-[9px] tracking-wide">Factura</th>`;

if (file.includes(oldCsvMatchedHeaders)) {
  file = file.replace(oldCsvMatchedHeaders, newCsvMatchedHeaders);
  console.log('6. CSV Import matched headers updated successfully');
} else {
  console.log('6. CSV Import matched headers pattern not found');
}

const oldCsvMatchedRow = `<td className="px-4 py-2 font-semibold max-w-[180px] truncate">{item.clientName}</td>
                                    <td className="px-4 py-2 text-gray-400 whitespace-nowrap">{r.order_date}</td>
                                    <td className="px-4 py-2">
                                      <span className={cn("px-1.5 py-0.5 rounded text-[9px] font-black uppercase", r.size ? (darkMode ? "bg-white/10 text-gray-300" : "bg-gray-800 text-white") : (darkMode ? "text-gray-600" : "text-gray-400"))}>
                                        {r.size || '—'}
                                      </span>
                                    </td>
                                    <td className="px-4 py-2 text-center font-black">{r.quantity}</td>
                                    <td className={cn("px-4 py-2 font-mono text-[10px]", darkMode ? "text-gray-600" : "text-gray-400")}>{r.invoice_number || '—'}</td>`;

const newCsvMatchedRow = `<td className="px-4 py-2 font-semibold max-w-[150px] truncate">{item.clientName}</td>
                                    <td className="px-4 py-2 text-gray-400 whitespace-nowrap">{r.order_date}</td>
                                    <td className={cn("px-4 py-2 font-mono text-[10px] font-bold", darkMode ? "text-cyan-400" : "text-cyan-700")}>{r.product_code || '—'}</td>
                                    <td className="px-4 py-2 font-medium max-w-[200px] truncate">{r.product_name || r.size || '—'}</td>
                                    <td className="px-4 py-2 font-semibold text-[9px] uppercase">{r.categoria || 'PELICULAS'}</td>
                                    <td className="px-4 py-2 text-center font-black">{r.quantity}</td>
                                    <td className={cn("px-4 py-2 font-mono text-[10px]", darkMode ? "text-gray-600" : "text-gray-400")}>{r.invoice_number || '—'}</td>`;

if (file.includes(oldCsvMatchedRow)) {
  file = file.replace(oldCsvMatchedRow, newCsvMatchedRow);
  console.log('7. CSV Import matched row updated successfully');
} else {
  console.log('7. CSV Import matched row pattern not found');
}

// 7. Update toCreate table in CSV Import preview (with Category badges)
const oldToCreateBlock = `                  {/* New clients to create */}
                  {csvImportResults.toCreate.length > 0 && (() => {
                    // Group toCreate by canonical clientName (already deduplicated by code in handleCsvFileChange)
                    const grouped = new Map<string, { province: string; salesperson: string; clientCode: string; totalCajas: number; registros: number }>();
                    csvImportResults.toCreate.forEach(item => {
                      const r = mapRowToRecord(item.row, 0, 0);
                      const existing = grouped.get(item.clientName);
                      if (existing) {
                        existing.totalCajas += r.quantity;
                        existing.registros += 1;
                      } else {
                        grouped.set(item.clientName, {
                          province: item.province,
                          salesperson: item.salesperson,
                          clientCode: item.clientCode,
                          totalCajas: r.quantity,
                          registros: 1,
                        });
                      }
                    });
                    const uniqueClients = [...grouped.entries()];
                    return (
                    <div>
                      <h4 className={cn("text-[10px] font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5", darkMode ? "text-gray-500" : "text-gray-400")}>
                        <Plus className="w-3.5 h-3.5 text-blue-400" /> {uniqueClients.length} clientes nuevos que se crearán automáticamente
                      </h4>
                      <div className={cn("rounded-xl border overflow-hidden", darkMode ? "border-blue-500/20" : "border-blue-100")}>
                        <div className="overflow-x-auto max-h-44 overflow-y-auto custom-scrollbar">
                          <table className="w-full text-left text-xs min-w-[500px]">
                            <thead className={cn("sticky top-0", darkMode ? "bg-blue-500/10 text-blue-400" : "bg-blue-50 text-blue-600")}>
                              <tr>
                                <th className="px-4 py-2 font-bold uppercase text-[9px] tracking-wide">Nuevo cliente</th>
                                <th className="px-4 py-2 font-bold uppercase text-[9px] tracking-wide">Cód.</th>
                                <th className="px-4 py-2 font-bold uppercase text-[9px] tracking-wide">Provincia</th>
                                <th className="px-4 py-2 font-bold uppercase text-[9px] tracking-wide">Vendedor</th>
                                <th className="px-4 py-2 font-bold uppercase text-[9px] tracking-wide text-center">Registros</th>
                                <th className="px-4 py-2 font-bold uppercase text-[9px] tracking-wide text-center">Total cajas</th>
                              </tr>
                            </thead>
                            <tbody className={cn("divide-y", darkMode ? "divide-white/5" : "divide-blue-50")}>
                              {uniqueClients.map(([clientName, info], i) => (
                                <tr key={i} className={cn(darkMode ? "hover:bg-white/3" : "hover:bg-blue-50/40")}>
                                  <td className="px-4 py-2 font-semibold max-w-[160px] truncate text-blue-400">{clientName}</td>
                                  <td className={cn("px-4 py-2 font-mono text-[10px]", darkMode ? "text-gray-500" : "text-gray-400")}>{info.clientCode || '—'}</td>
                                  <td className={cn("px-4 py-2 capitalize", darkMode ? "text-gray-400" : "text-gray-500")}>{info.province || '—'}</td>
                                  <td className={cn("px-4 py-2", darkMode ? "text-gray-400" : "text-gray-500")}>{info.salesperson || '—'}</td>
                                  <td className="px-4 py-2 text-center text-gray-400">{info.registros}</td>
                                  <td className="px-4 py-2 text-center font-black">{info.totalCajas}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                      <p className={cn("text-[10px] mt-2 flex items-center gap-1", darkMode ? "text-blue-400/60" : "text-blue-500/70")}>
                        <AlertCircle className="w-3 h-3" />
                        Los clientes nuevos se crearán con provincia, vendedor y código extraídos del CSV. Puedes editar sus datos después.
                      </p>
                    </div>
                    );
                  })()}`;

const newToCreateBlock = `                  {/* New clients to create */}
                  {csvImportResults.toCreate.length > 0 && (() => {
                    const grouped = new Map<string, { province: string; salesperson: string; clientCode: string; registros: number; categorias: Map<string, number> }>();
                    csvImportResults.toCreate.forEach(item => {
                      const r = mapRowToRecord(item.row, 0, 0);
                      const cat = r.categoria || 'PELICULAS';
                      const existing = grouped.get(item.clientName);
                      if (existing) {
                        existing.registros += 1;
                        existing.categorias.set(cat, (existing.categorias.get(cat) || 0) + 1);
                      } else {
                        const catMap = new Map<string, number>();
                        catMap.set(cat, 1);
                        grouped.set(item.clientName, {
                          province: item.province,
                          salesperson: item.salesperson,
                          clientCode: item.clientCode,
                          registros: 1,
                          categorias: catMap,
                        });
                      }
                    });
                    const catColor: Record<string, string> = {
                      PELICULAS:     'bg-red-500/15 text-red-400',
                      ACCESORIOS:    'bg-orange-500/15 text-orange-400',
                      EQUIPOS:       'bg-blue-500/15 text-blue-400',
                      QUIMICOS:      'bg-yellow-500/15 text-yellow-500',
                      REPUESTOS:     'bg-purple-500/15 text-purple-400',
                      SERVICIOS:     'bg-cyan-500/15 text-cyan-400',
                      MANTENIMIENTO: 'bg-teal-500/15 text-teal-400',
                      CONTRASTES:    'bg-pink-500/15 text-pink-400',
                      ALIANZA:       'bg-indigo-500/15 text-indigo-400',
                      INTERESES:     'bg-gray-500/15 text-gray-400',
                      MAMOTOME:      'bg-rose-500/15 text-rose-400',
                    };
                    const uniqueClients = [...grouped.entries()];
                    return (
                    <div>
                      <h4 className={cn("text-[10px] font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5", darkMode ? "text-gray-500" : "text-gray-400")}>
                        <Plus className="w-3.5 h-3.5 text-blue-400" /> {uniqueClients.length} clientes nuevos que se crearán automáticamente
                      </h4>
                      <div className={cn("rounded-xl border overflow-hidden", darkMode ? "border-blue-500/20" : "border-blue-100")}>
                        <div className="overflow-x-auto max-h-44 overflow-y-auto custom-scrollbar">
                          <table className="w-full text-left text-xs min-w-[560px]">
                            <thead className={cn("sticky top-0", darkMode ? "bg-blue-500/10 text-blue-400" : "bg-blue-50 text-blue-600")}>
                              <tr>
                                <th className="px-4 py-2 font-bold uppercase text-[9px] tracking-wide">Nuevo cliente</th>
                                <th className="px-4 py-2 font-bold uppercase text-[9px] tracking-wide">Cód.</th>
                                <th className="px-4 py-2 font-bold uppercase text-[9px] tracking-wide">Provincia</th>
                                <th className="px-4 py-2 font-bold uppercase text-[9px] tracking-wide">Vendedor</th>
                                <th className="px-4 py-2 font-bold uppercase text-[9px] tracking-wide text-center">Registros</th>
                                <th className="px-4 py-2 font-bold uppercase text-[9px] tracking-wide">Categorías</th>
                              </tr>
                            </thead>
                            <tbody className={cn("divide-y", darkMode ? "divide-white/5" : "divide-blue-50")}>
                              {uniqueClients.map(([clientName, info], i) => (
                                <tr key={i} className={cn(darkMode ? "hover:bg-white/3" : "hover:bg-blue-50/40")}>
                                  <td className="px-4 py-2 font-semibold max-w-[160px] truncate text-blue-400">{clientName}</td>
                                  <td className={cn("px-4 py-2 font-mono text-[10px]", darkMode ? "text-gray-500" : "text-gray-400")}>{info.clientCode || '—'}</td>
                                  <td className={cn("px-4 py-2 capitalize", darkMode ? "text-gray-400" : "text-gray-500")}>{info.province || '—'}</td>
                                  <td className={cn("px-4 py-2", darkMode ? "text-gray-400" : "text-gray-500")}>{info.salesperson || '—'}</td>
                                  <td className="px-4 py-2 text-center text-gray-400">{info.registros}</td>
                                  <td className="px-4 py-2">
                                    <div className="flex flex-wrap gap-1">
                                      {[...info.categorias.entries()].sort((a,b) => b[1]-a[1]).map(([cat, count]) => (
                                        <span key={cat} className={cn("inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[9px] font-bold", catColor[cat] || 'bg-gray-500/15 text-gray-400')}>
                                          {cat} <span className="opacity-60">×{count}</span>
                                        </span>
                                      ))}
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                      <p className={cn("text-[10px] mt-2 flex items-center gap-1", darkMode ? "text-blue-400/60" : "text-blue-500/70")}>
                        <AlertCircle className="w-3 h-3" />
                        Los clientes nuevos se crearán con provincia, vendedor y código extraídos del CSV. Puedes editar sus datos después.
                      </p>
                    </div>
                    );
                  })()}`;

if (file.includes(oldToCreateBlock)) {
  file = file.replace(oldToCreateBlock, newToCreateBlock);
  console.log('8. toCreate table in CSV Import preview updated successfully');
} else {
  console.log('8. toCreate table pattern not found');
}

fs.writeFileSync('src/App.tsx', file.replace(/\n/g, '\r\n'), 'utf8');
