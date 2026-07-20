#!/usr/bin/env python3
"""Patch App.tsx: make client records table category-aware."""

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# ---- PATCH 1: Medida cell ----
old1 = (
    '                              <td className="px-6 py-3.5 whitespace-nowrap">\r\n'
    '                                 <span className={cn(\r\n'
    '                                   "px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wide",\r\n'
    '                                   darkMode ? "bg-white/12 text-gray-200" : "bg-gray-800 text-white"\r\n'
    '                                 )}>\r\n'
    '                                   {record.size}\r\n'
    '                                 </span>\r\n'
    '                               </td>\r\n'
)
new1 = (
    '                              <td className="px-6 py-3.5 whitespace-nowrap">\r\n'
    '                                 {activeCategory === \'PELICULAS\' ? (\r\n'
    '                                   <span className={cn("px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wide", darkMode ? "bg-white/12 text-gray-200" : "bg-gray-800 text-white")}>\r\n'
    '                                     {record.size || \'\u2014\'}\r\n'
    '                                   </span>\r\n'
    '                                 ) : (\r\n'
    '                                   <span className={cn("text-xs font-medium", darkMode ? "text-gray-300" : "text-gray-700")}>\r\n'
    '                                     {record.size || \'\u2014\'}\r\n'
    '                                   </span>\r\n'
    '                                 )}\r\n'
    '                               </td>\r\n'
)

# ---- PATCH 2: Tipo cell ----
old2 = (
    '                              <td className="px-6 py-3.5 whitespace-nowrap">\r\n'
    '                                 {record.film_type ? (\r\n'
    '                                   <span className={cn(\r\n'
    '                                     "px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wide",\r\n'
    '                                     record.film_type === \'DIHL\'\r\n'
    '                                       ? (darkMode ? "bg-blue-500/20 text-blue-400" : "bg-blue-100 text-blue-700")\r\n'
    '                                       : record.film_type === \'DIML\'\r\n'
    '                                       ? (darkMode ? "bg-purple-500/20 text-purple-400" : "bg-purple-100 text-purple-700")\r\n'
    '                                       : (darkMode ? "bg-[#ED1C24]/20 text-[#ED1C24]" : "bg-red-100 text-red-700")\r\n'
    '                                   )}>\r\n'
    '                                     {record.film_type}\r\n'
    '                                   </span>\r\n'
    '                                 ) : (\r\n'
    '                                   <span className={cn("text-[9px]", darkMode ? "text-gray-700" : "text-gray-300")}>\u2014</span>\r\n'
    '                                 )}\r\n'
    '                               </td>\r\n'
)
new2 = (
    '                              <td className="px-6 py-3.5 whitespace-nowrap">\r\n'
    '                                 {activeCategory === \'PELICULAS\' ? (\r\n'
    '                                   record.film_type ? (\r\n'
    '                                     <span className={cn("px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wide",\r\n'
    '                                       record.film_type === \'DIHL\' ? (darkMode ? "bg-blue-500/20 text-blue-400" : "bg-blue-100 text-blue-700")\r\n'
    '                                       : record.film_type === \'DIML\' ? (darkMode ? "bg-purple-500/20 text-purple-400" : "bg-purple-100 text-purple-700")\r\n'
    '                                       : (darkMode ? "bg-[#ED1C24]/20 text-[#ED1C24]" : "bg-red-100 text-red-700")\r\n'
    '                                     )}>{record.film_type}</span>\r\n'
    '                                   ) : <span className={cn("text-[9px]", darkMode ? "text-gray-700" : "text-gray-300")}>\u2014</span>\r\n'
    '                                 ) : (\r\n'
    '                                   <span className={cn("px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wide",\r\n'
    '                                     (record as any).categoria === \'ACCESORIOS\'    ? (darkMode ? "bg-orange-500/20 text-orange-400" : "bg-orange-100 text-orange-700") :\r\n'
    '                                     (record as any).categoria === \'EQUIPOS\'       ? (darkMode ? "bg-blue-500/20 text-blue-400" : "bg-blue-100 text-blue-700") :\r\n'
    '                                     (record as any).categoria === \'QUIMICOS\'      ? (darkMode ? "bg-yellow-500/20 text-yellow-400" : "bg-yellow-100 text-yellow-700") :\r\n'
    '                                     (record as any).categoria === \'REPUESTOS\'     ? (darkMode ? "bg-purple-500/20 text-purple-400" : "bg-purple-100 text-purple-700") :\r\n'
    '                                     (record as any).categoria === \'SERVICIOS\'     ? (darkMode ? "bg-cyan-500/20 text-cyan-400" : "bg-cyan-100 text-cyan-700") :\r\n'
    '                                     (record as any).categoria === \'MANTENIMIENTO\' ? (darkMode ? "bg-teal-500/20 text-teal-400" : "bg-teal-100 text-teal-700") :\r\n'
    '                                     (record as any).categoria === \'CONTRASTES\'    ? (darkMode ? "bg-pink-500/20 text-pink-400" : "bg-pink-100 text-pink-700") :\r\n'
    '                                     (record as any).categoria === \'ALIANZA\'       ? (darkMode ? "bg-indigo-500/20 text-indigo-400" : "bg-indigo-100 text-indigo-700") :\r\n'
    '                                     (record as any).categoria === \'MAMOTOME\'      ? (darkMode ? "bg-rose-500/20 text-rose-400" : "bg-rose-100 text-rose-700") :\r\n'
    '                                                                                     (darkMode ? "bg-gray-500/20 text-gray-400" : "bg-gray-100 text-gray-600")\r\n'
    '                                   )}>{(record as any).categoria || \'\u2014\'}</span>\r\n'
    '                                 )}\r\n'
    '                               </td>\r\n'
)

# ---- PATCH 3: m² cell wrap ----
old3 = (
    '                              <td className="px-6 py-3.5 text-center whitespace-nowrap">\r\n'
    '                                 {getM2PerBox(record.size, record.film_type) > 0 ? (\r\n'
    '                                   <span className={cn("text-xs font-semibold", darkMode ? "text-cyan-400" : "text-cyan-600")}>\r\n'
    '                                     {getTotalM2(record.quantity, record.size, record.film_type).toFixed(2)}\r\n'
    '                                   </span>\r\n'
    '                                 ) : (\r\n'
    '                                   <span className={cn("text-[10px]", darkMode ? "text-gray-700" : "text-gray-300")}>\u2014</span>\r\n'
    '                                 )}\r\n'
    '                               </td>\r\n'
)
new3 = (
    '                              {activeCategory === \'PELICULAS\' && (\r\n'
    '                               <td className="px-6 py-3.5 text-center whitespace-nowrap">\r\n'
    '                                 {getM2PerBox(record.size, record.film_type) > 0 ? (\r\n'
    '                                   <span className={cn("text-xs font-semibold", darkMode ? "text-cyan-400" : "text-cyan-600")}>\r\n'
    '                                     {getTotalM2(record.quantity, record.size, record.film_type).toFixed(2)}\r\n'
    '                                   </span>\r\n'
    '                                 ) : (\r\n'
    '                                   <span className={cn("text-[10px]", darkMode ? "text-gray-700" : "text-gray-300")}>\u2014</span>\r\n'
    '                                 )}\r\n'
    '                               </td>\r\n'
    '                               )}\r\n'
)

patches = [(old1, new1, 'Medida cell'), (old2, new2, 'Tipo cell'), (old3, new3, 'm² cell')]
for old, new, name in patches:
    if old in content:
        content = content.replace(old, new, 1)
        print(f'OK: {name}')
    else:
        print(f'MISSING: {name} — searching for key lines...')
        key = '{record.size}' if 'size' in old else ('{record.film_type}' if 'film_type' in old and 'DIHL' in old else 'getM2PerBox')
        idx = content.find(key)
        print(f'  key "{key}" at index: {idx}')
        # Print surrounding 200 chars
        if idx > 0:
            print(repr(content[max(0,idx-100):idx+200]))

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print('Done.')
