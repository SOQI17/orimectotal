const fs = require('fs');

let file = fs.readFileSync('src/App.tsx', 'utf8').replace(/\r\n/g, '\n');

const oldBlock = `                            <td className="px-4 py-3 text-center">
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
                              <span className={cn("text-[9px] block", darkMode ? "text-gray-600" : "text-gray-400")}>{item.monthlyAvg} cj</span>
                            </td>
                            {item.forecast.map((m: any, mi: number) => (
                              <td key={mi} className="px-3 py-3 text-center">
                                <span className={cn("font-bold text-xs",
                                  m.projected === 0 ? (darkMode ? "text-gray-700" : "text-gray-300") :
                                  m.projected > item.monthlyAvg * 1.2 ? "text-emerald-400" :
                                  m.projected < item.monthlyAvg * 0.8 ? "text-amber-400" : ""
                                )}>{m.projected || '—'}</span>
                              </td>
                            ))}
                            <td className="px-4 py-3 text-center">
                              <span className={cn("font-black text-sm", darkMode ? "text-cyan-400" : "text-cyan-600")}>
                                {(() => {
                                  const SIZES = ['8x10','10x12','10x14','14x17'];
                                  const sizeTotal = Object.values(item.sizeAvg as Record<string,number>).reduce((a:number,b:number)=>a+b,0);
                                  return SIZES.reduce((s: number, size: string) => {
                                    const share = sizeTotal > 0 ? (item.sizeAvg[size]||0)/sizeTotal : 0;
                                    return s + getTotalM2(item.annualTotal * share, size, globalFilmFilter === 'DIHL' ? 'DIHL' : 'DIHT');
                                  }, 0).toFixed(0);
                                })()} m²
                              </span>
                              <span className={cn("text-[9px] block", darkMode ? "text-gray-600" : "text-gray-400")}>{item.annualTotal} cj</span>
                            </td>`;

const newBlock = `                            <td className="px-4 py-3 text-center">
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
                              <span className={cn("text-[9px] block", darkMode ? "text-gray-600" : "text-gray-400")}>
                                {activeCategory === 'PELICULAS' ? \`\${item.monthlyAvg} cj\` : 'unid/mes'}
                              </span>
                            </td>
                            {item.forecast.map((m: any, mi: number) => (
                              <td key={mi} className="px-3 py-3 text-center">
                                <span className={cn("font-bold text-xs",
                                  m.projected === 0 ? (darkMode ? "text-gray-700" : "text-gray-300") :
                                  m.projected > item.monthlyAvg * 1.2 ? "text-emerald-400" :
                                  m.projected < item.monthlyAvg * 0.8 ? "text-amber-400" : ""
                                )}>{m.projected || '—'}</span>
                              </td>
                            ))}
                            <td className="px-4 py-3 text-center">
                              <span className={cn("font-black text-sm", darkMode ? "text-cyan-400" : "text-cyan-600")}>
                                {activeCategory === 'PELICULAS' ? (
                                  (() => {
                                    const SIZES = ['8x10','10x12','10x14','14x17'];
                                    const sizeTotal = Object.values(item.sizeAvg as Record<string,number>).reduce((a:number,b:number)=>a+b,0);
                                    return SIZES.reduce((s: number, size: string) => {
                                      const share = sizeTotal > 0 ? (item.sizeAvg[size]||0)/sizeTotal : 0;
                                      return s + getTotalM2(item.annualTotal * share, size, globalFilmFilter === 'DIHL' ? 'DIHL' : 'DIHT');
                                    }, 0).toFixed(0) + ' m²';
                                  })()
                                ) : (
                                  item.annualTotal + ' unid.'
                                )}
                              </span>
                              <span className={cn("text-[9px] block", darkMode ? "text-gray-600" : "text-gray-400")}>
                                {activeCategory === 'PELICULAS' ? \`\${item.annualTotal} cj\` : 'anual'}
                              </span>
                            </td>`;

if (file.includes(oldBlock)) {
  file = file.replace(oldBlock, newBlock);
  console.log('Cell table body updated successfully');
} else {
  console.log('Cell table body pattern not found');
}

fs.writeFileSync('src/App.tsx', file.replace(/\n/g, '\r\n'), 'utf8');
