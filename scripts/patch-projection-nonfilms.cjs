const fs = require('fs');

let file = fs.readFileSync('src/App.tsx', 'utf8').replace(/\r\n/g, '\n');

// 1. KPI cards header labels
const oldKpiBoxes = `<p className={cn("text-[10px] mt-0.5", darkMode ? "text-gray-600" : "text-gray-400")}>{clientProjection.reduce((s: number, c: any) => s + c.annualTotal, 0).toLocaleString()} cajas</p>`;
const newKpiBoxes = `<p className={cn("text-[10px] mt-0.5", darkMode ? "text-gray-600" : "text-gray-400")}>
                      {activeCategory === 'PELICULAS'
                        ? \`\${clientProjection.reduce((s: number, c: any) => s + c.annualTotal, 0).toLocaleString()} cajas\`
                        : \`\${clientProjection.reduce((s: number, c: any) => s + c.annualTotal, 0).toLocaleString()} unidades\`
                      }
                    </p>`;

if (file.includes(oldKpiBoxes)) {
  file = file.replace(oldKpiBoxes, newKpiBoxes);
  console.log('1. KPI header units label updated');
} else {
  console.log('1. KPI header units label pattern not found');
}

// 2. Hide Fujifilm Purchase Recommendation for non-film categories
const oldFujiStart = `{/* ── PURCHASE RECOMMENDATION — powered by Fujifilm Planning Film ── */}
                {(() => {`;

const newFujiStart = `{/* ── PURCHASE RECOMMENDATION — powered by Fujifilm Planning Film (PELICULAS ONLY) ── */}
                {activeCategory === 'PELICULAS' && (() => {`;

if (file.includes(oldFujiStart)) {
  file = file.replace(oldFujiStart, newFujiStart);
  console.log('2. Fujifilm purchase recommendation wrapped in PELICULAS check');
} else {
  console.log('2. Fujifilm purchase recommendation pattern not found');
}

// 3. Update table headers in Proyección por cliente
const oldColM2Mes = `<th className="px-4 py-2.5 text-center whitespace-nowrap">m²/mes</th>`;
const newColM2Mes = `<th className="px-4 py-2.5 text-center whitespace-nowrap">{activeCategory === 'PELICULAS' ? 'm²/mes' : 'Unid/mes'}</th>`;

if (file.includes(oldColM2Mes)) {
  file = file.replace(oldColM2Mes, newColM2Mes);
  console.log('3. m²/mes column header updated');
} else {
  console.log('3. m²/mes column header pattern not found');
}

const oldColM2Anual = `<th className="px-4 py-2.5 text-center whitespace-nowrap">m² anual</th>`;
const newColM2Anual = `<th className="px-4 py-2.5 text-center whitespace-nowrap">{activeCategory === 'PELICULAS' ? 'm² anual' : 'Unid. Anual'}</th>`;

if (file.includes(oldColM2Anual)) {
  file = file.replace(oldColM2Anual, newColM2Anual);
  console.log('4. m² anual column header updated');
} else {
  console.log('4. m² anual column header pattern not found');
}

// 5. Update cell m²/mes in Proyección por cliente table
const oldM2Cell = `<td className="px-4 py-3 text-center">
                              <span className={cn("font-black text-sm", darkMode ? "text-cyan-400" : "text-cyan-600")}>
                                {(() => {
                                  const SIZES = ['8x10','10x12','10x14','14x17'];
                                  const sizeTotal = Object.values(item.sizeAvg as Record<string,number>).reduce((a:number,b:number)=>a+b,0);
                                  return SIZES.reduce((s: number, size: string) => {
                                    const share = sizeTotal > 0 ? (item.sizeAvg[size]||0)/sizeTotal : 0;
                                    return s + getTotalM2(item.monthlyAvg * share, size, globalFilmFilter === 'DIHL' ? 'DIHL' : 'DIHT');
                                  }, 0).toFixed(1);
                                })()}
                              </span>
                            </td>`;

const newM2Cell = `<td className="px-4 py-3 text-center">
                              <span className={cn("font-black text-sm", darkMode ? "text-cyan-400" : "text-cyan-600")}>
                                {activeCategory === 'PELICULAS' ? (
                                  (() => {
                                    const SIZES = ['8x10','10x12','10x14','14x17'];
                                    const sizeTotal = Object.values(item.sizeAvg as Record<string,number>).reduce((a:number,b:number)=>a+b,0);
                                    return SIZES.reduce((s: number, size: string) => {
                                      const share = sizeTotal > 0 ? (item.sizeAvg[size]||0)/sizeTotal : 0;
                                      return s + getTotalM2(item.monthlyAvg * share, size, globalFilmFilter === 'DIHL' ? 'DIHL' : 'DIHT');
                                    }, 0).toFixed(1);
                                  })()
                                ) : (
                                  item.monthlyAvg.toFixed(1)
                                )}
                              </span>
                            </td>`;

if (file.includes(oldM2Cell)) {
  file = file.replace(oldM2Cell, newM2Cell);
  console.log('5. Cell m²/mes updated');
} else {
  console.log('5. Cell m²/mes pattern not found');
}

// 6. Update cell m² anual in Proyección por cliente table
const oldM2AnualCell = `<td className="px-4 py-3 text-center font-bold">{item.annualM2.toFixed(1)}</td>`;
const newM2AnualCell = `<td className="px-4 py-3 text-center font-bold">{activeCategory === 'PELICULAS' ? item.annualM2.toFixed(1) : item.annualTotal}</td>`;

if (file.includes(oldM2AnualCell)) {
  file = file.replace(oldM2AnualCell, newM2AnualCell);
  console.log('6. Cell m² anual updated');
} else {
  console.log('6. Cell m² anual pattern not found');
}

fs.writeFileSync('src/App.tsx', file.replace(/\n/g, '\r\n'), 'utf8');
