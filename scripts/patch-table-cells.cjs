const fs = require('fs');

let file = fs.readFileSync('src/App.tsx', 'utf8');

// Normalize CRLF to LF for matching
file = file.replace(/\r\n/g, '\n');

// 1. Medida cell
const oldMedida = `                              <td className="px-6 py-3.5 whitespace-nowrap">
                                <span className={cn(
                                  "px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wide",
                                  darkMode ? "bg-white/12 text-gray-200" : "bg-gray-800 text-white"
                                )}>
                                  {record.size}
                                </span>
                              </td>`;

const newMedida = `                              <td className="px-6 py-3.5 whitespace-nowrap">
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

if (file.includes(oldMedida)) {
  file = file.replace(oldMedida, newMedida);
  console.log('Medida cell replaced successfully');
} else {
  console.log('Medida cell pattern not found');
}

// 2. Tipo cell
const oldTipo = `                              <td className="px-6 py-3.5 whitespace-nowrap">
                                {record.film_type ? (
                                  <span className={cn(
                                    "px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wide",
                                    record.film_type === 'DIHL'
                                      ? (darkMode ? "bg-blue-500/20 text-blue-400" : "bg-blue-100 text-blue-700")
                                      : record.film_type === 'DIML'
                                      ? (darkMode ? "bg-purple-500/20 text-purple-400" : "bg-purple-100 text-purple-700")
                                      : (darkMode ? "bg-[#ED1C24]/20 text-[#ED1C24]" : "bg-red-100 text-red-700")
                                  )}>
                                    {record.film_type}
                                  </span>
                                ) : (
                                  <span className={cn("text-[9px]", darkMode ? "text-gray-700" : "text-gray-300")}>—</span>
                                )}
                              </td>`;

const newTipo = `                              <td className="px-6 py-3.5 whitespace-nowrap">
                                {activeCategory === 'PELICULAS' ? (
                                  record.film_type ? (
                                    <span className={cn("px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wide",
                                      record.film_type === 'DIHL' ? (darkMode ? "bg-blue-500/20 text-blue-400" : "bg-blue-100 text-blue-700")
                                      : record.film_type === 'DIML' ? (darkMode ? "bg-purple-500/20 text-purple-400" : "bg-purple-100 text-purple-700")
                                      : (darkMode ? "bg-[#ED1C24]/20 text-[#ED1C24]" : "bg-red-100 text-red-700")
                                    )}>{record.film_type}</span>
                                  ) : <span className={cn("text-[9px]", darkMode ? "text-gray-700" : "text-gray-300")}>—</span>
                                ) : (
                                  <span className={cn("px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wide",
                                    (record as any).categoria === 'ACCESORIOS'    ? (darkMode ? "bg-orange-500/20 text-orange-400" : "bg-orange-100 text-orange-700") :
                                    (record as any).categoria === 'EQUIPOS'       ? (darkMode ? "bg-blue-500/20 text-blue-400" : "bg-blue-100 text-blue-700") :
                                    (record as any).categoria === 'QUIMICOS'      ? (darkMode ? "bg-yellow-500/20 text-yellow-400" : "bg-yellow-100 text-yellow-700") :
                                    (record as any).categoria === 'REPUESTOS'     ? (darkMode ? "bg-purple-500/20 text-purple-400" : "bg-purple-100 text-purple-700") :
                                    (record as any).categoria === 'SERVICIOS'     ? (darkMode ? "bg-cyan-500/20 text-cyan-400" : "bg-cyan-100 text-cyan-700") :
                                    (record as any).categoria === 'MANTENIMIENTO' ? (darkMode ? "bg-teal-500/20 text-teal-400" : "bg-teal-100 text-teal-700") :
                                    (record as any).categoria === 'CONTRASTES'    ? (darkMode ? "bg-pink-500/20 text-pink-400" : "bg-pink-100 text-pink-700") :
                                    (record as any).categoria === 'ALIANZA'       ? (darkMode ? "bg-indigo-500/20 text-indigo-400" : "bg-indigo-100 text-indigo-700") :
                                    (record as any).categoria === 'MAMOTOME'      ? (darkMode ? "bg-rose-500/20 text-rose-400" : "bg-rose-100 text-rose-700") :
                                                                                    (darkMode ? "bg-gray-500/20 text-gray-400" : "bg-gray-100 text-gray-600")
                                  )}>{(record as any).categoria || '—'}</span>
                                )}
                              </td>`;

if (file.includes(oldTipo)) {
  file = file.replace(oldTipo, newTipo);
  console.log('Tipo cell replaced successfully');
} else {
  console.log('Tipo cell pattern not found');
}

// 3. m2 cell
const oldM2 = `                              <td className="px-6 py-3.5 text-center whitespace-nowrap">
                                {getM2PerBox(record.size, record.film_type) > 0 ? (
                                  <span className={cn("text-xs font-semibold", darkMode ? "text-cyan-400" : "text-cyan-600")}>
                                    {getTotalM2(record.quantity, record.size, record.film_type).toFixed(2)}
                                  </span>
                                ) : (
                                  <span className={cn("text-[10px]", darkMode ? "text-gray-700" : "text-gray-300")}>—</span>
                                )}
                              </td>`;

const newM2 = `                              {activeCategory === 'PELICULAS' && (
                                <td className="px-6 py-3.5 text-center whitespace-nowrap">
                                  {getM2PerBox(record.size, record.film_type) > 0 ? (
                                    <span className={cn("text-xs font-semibold", darkMode ? "text-cyan-400" : "text-cyan-600")}>
                                      {getTotalM2(record.quantity, record.size, record.film_type).toFixed(2)}
                                    </span>
                                  ) : (
                                    <span className={cn("text-[10px]", darkMode ? "text-gray-700" : "text-gray-300")}>—</span>
                                  )}
                                </td>
                              )}`;

if (file.includes(oldM2)) {
  file = file.replace(oldM2, newM2);
  console.log('M2 cell replaced successfully');
} else {
  console.log('M2 cell pattern not found');
}

fs.writeFileSync('src/App.tsx', file.replace(/\n/g, '\r\n'), 'utf8');
