#!/usr/bin/env python3
import re

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

old_block = '''                   {/* New clients to create */}
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
                   })()}'''

new_block = '''                   {/* New clients to create */}
                   {csvImportResults.toCreate.length > 0 && (() => {
                     // Group by clientName — track categories (linea) per client
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
                         <Plus className="w-3.5 h-3.5 text-blue-400" /> {uniqueClients.length} clientes nuevos que se crear\u00e1n autom\u00e1ticamente
                       </h4>
                       <div className={cn("rounded-xl border overflow-hidden", darkMode ? "border-blue-500/20" : "border-blue-100")}>
                         <div className="overflow-x-auto max-h-44 overflow-y-auto custom-scrollbar">
                           <table className="w-full text-left text-xs min-w-[560px]">
                             <thead className={cn("sticky top-0", darkMode ? "bg-blue-500/10 text-blue-400" : "bg-blue-50 text-blue-600")}>
                               <tr>
                                 <th className="px-4 py-2 font-bold uppercase text-[9px] tracking-wide">Nuevo cliente</th>
                                 <th className="px-4 py-2 font-bold uppercase text-[9px] tracking-wide">C\u00f3d.</th>
                                 <th className="px-4 py-2 font-bold uppercase text-[9px] tracking-wide">Provincia</th>
                                 <th className="px-4 py-2 font-bold uppercase text-[9px] tracking-wide">Vendedor</th>
                                 <th className="px-4 py-2 font-bold uppercase text-[9px] tracking-wide text-center">Registros</th>
                                 <th className="px-4 py-2 font-bold uppercase text-[9px] tracking-wide">Categor\u00edas</th>
                               </tr>
                             </thead>
                             <tbody className={cn("divide-y", darkMode ? "divide-white/5" : "divide-blue-50")}>
                               {uniqueClients.map(([clientName, info], i) => (
                                 <tr key={i} className={cn(darkMode ? "hover:bg-white/3" : "hover:bg-blue-50/40")}>
                                   <td className="px-4 py-2 font-semibold max-w-[160px] truncate text-blue-400">{clientName}</td>
                                   <td className={cn("px-4 py-2 font-mono text-[10px]", darkMode ? "text-gray-500" : "text-gray-400")}>{info.clientCode || '\u2014'}</td>
                                   <td className={cn("px-4 py-2 capitalize", darkMode ? "text-gray-400" : "text-gray-500")}>{info.province || '\u2014'}</td>
                                   <td className={cn("px-4 py-2", darkMode ? "text-gray-400" : "text-gray-500")}>{info.salesperson || '\u2014'}</td>
                                   <td className="px-4 py-2 text-center text-gray-400">{info.registros}</td>
                                   <td className="px-4 py-2">
                                     <div className="flex flex-wrap gap-1">
                                       {[...info.categorias.entries()].sort((a,b) => b[1]-a[1]).map(([cat, count]) => (
                                         <span key={cat} className={cn("inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[9px] font-bold", catColor[cat] || 'bg-gray-500/15 text-gray-400')}>
                                           {cat} <span className="opacity-60">\u00d7{count}</span>
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
                         Los clientes nuevos se crear\u00e1n con provincia, vendedor y c\u00f3digo extra\u00eddos del CSV. Puedes editar sus datos despu\u00e9s.
                       </p>
                     </div>
                     );
                   })()}'''

# Normalize line endings to LF for matching
content_lf = content.replace('\r\n', '\n')
old_lf = old_block.replace('\r\n', '\n')
new_lf = new_block.replace('\r\n', '\n')

if old_lf in content_lf:
    content_lf = content_lf.replace(old_lf, new_lf, 1)
    # Write back with original CRLF
    with open('src/App.tsx', 'w', encoding='utf-8', newline='\r\n') as f:
        f.write(content_lf)
    print('SUCCESS: block replaced')
else:
    print('ERROR: block not found — checking partial match...')
    # Check for partial marker
    marker = '// Group toCreate by canonical clientName (already deduplicated by code in handleCsvFileChange)'
    if marker in content_lf:
        print(f'  Marker found at index: {content_lf.index(marker)}')
    else:
        print('  Marker NOT found either')
