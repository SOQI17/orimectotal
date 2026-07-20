const fs = require('fs');

let file = fs.readFileSync('src/App.tsx', 'utf8').replace(/\r\n/g, '\n');

// 1. Update handleOpenNewRecord to include default categoria
const oldOpenNew = `  const handleOpenNewRecord = () => {
    setEditingRecord({
      client_id: selectedClient?.id || 0,
      order_date: format(new Date(), 'yyyy-MM-dd'),
      invoice_number: '',
      quantity: 1,
      size: '14x17',
      batch_number: '',
      expiry_date: format(new Date(new Date().setFullYear(new Date().getFullYear() + 1)), 'yyyy-MM-dd'),
      unit_cost: 0
    });
    setIsModalOpen(true);
  };`;

const newOpenNew = `  const handleOpenNewRecord = () => {
    setEditingRecord({
      client_id: selectedClient?.id || 0,
      order_date: format(new Date(), 'yyyy-MM-dd'),
      invoice_number: '',
      quantity: 1,
      size: activeCategory === 'PELICULAS' || activeCategory === 'ALL' ? '14x17' : '',
      batch_number: '',
      expiry_date: format(new Date(new Date().setFullYear(new Date().getFullYear() + 1)), 'yyyy-MM-dd'),
      unit_cost: 0,
      categoria: activeCategory !== 'ALL' ? activeCategory : 'PELICULAS'
    });
    setIsModalOpen(true);
  };`;

if (file.includes(oldOpenNew)) {
  file = file.replace(oldOpenNew, newOpenNew);
  console.log('1. handleOpenNewRecord updated successfully');
} else {
  console.log('1. handleOpenNewRecord pattern not found');
}

// 2. Replace entire Modal Form body in App.tsx
const oldModalForm = `            <form onSubmit={handleSaveRecord} className="p-8 space-y-6">
              <div className="space-y-4">
                {!selectedClient || !editingRecord.id ? (
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Cliente</label>
                    <select 
                      required
                      value={editingRecord.client_id}
                      onChange={e => setEditingRecord({...editingRecord, client_id: parseInt(e.target.value)})}
                      style={darkMode ? { colorScheme: 'dark' } : {}}
                      className={cn(
                        "w-full px-4 py-3 rounded-xl border-none focus:ring-2 focus:ring-[#ED1C24]/20 outline-none font-bold appearance-none",
                        darkMode ? "bg-[#16161A] text-white" : "bg-gray-50"
                      )}>
                      <option value="0">Seleccionar Cliente...</option>
                      {allClients.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Cliente</label>
                    <div className={cn(
                      "w-full px-4 py-3 rounded-xl font-bold",
                      darkMode ? "bg-white/10 text-gray-400" : "bg-gray-100 text-gray-500"
                    )}>
                      {allClients.find(c => c.id === editingRecord.client_id)?.name}
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Fecha de Pedido</label>
                    <input 
                      type="date" 
                      required
                      value={editingRecord.order_date || ''}
                      onChange={e => setEditingRecord({...editingRecord, order_date: e.target.value})}
                      className={cn(
                        "w-full px-4 py-3 rounded-xl border-none focus:ring-2 focus:ring-[#ED1C24]/20 outline-none font-bold",
                        darkMode ? "bg-white/5 text-white" : "bg-gray-50"
                      )}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Nº Factura</label>
                    <input 
                      type="text" 
                      placeholder="Ej: 001-001-000123"
                      value={editingRecord.invoice_number || ''}
                      onChange={e => setEditingRecord({...editingRecord, invoice_number: e.target.value})}
                      className={cn(
                        "w-full px-4 py-3 rounded-xl border-none focus:ring-2 focus:ring-[#ED1C24]/20 outline-none font-bold",
                        darkMode ? "bg-white/5 text-white" : "bg-gray-50"
                      )}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">
                      Cantidad (Cajas)
                      {(editingRecord as any).is_return && (
                        <span className="ml-2 px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[9px] font-black normal-case">retorno</span>
                      )}
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      required
                      placeholder="Ej: 3 o -3 para retorno"
                      value={(editingRecord as any).is_return ? -(editingRecord.quantity || 0) : (editingRecord.quantity || '')}
                      onChange={e => {
                        const raw = e.target.value;
                        const val = parseInt(raw);
                        if (raw === '' || raw === '-') { setEditingRecord({ ...editingRecord, quantity: 0, is_return: raw === '-' ? true : undefined } as any); return; }
                        if (isNaN(val)) return;
                        setEditingRecord({ ...editingRecord, quantity: Math.abs(val), is_return: val < 0 ? true : undefined } as any);
                      }}
                      className={cn(
                        "w-full px-4 py-3 rounded-xl border-none focus:ring-2 outline-none font-bold",
                        (editingRecord as any).is_return
                          ? "focus:ring-amber-400/30 ring-1 ring-amber-500/50 text-amber-400"
                          : "focus:ring-[#ED1C24]/20",
                        darkMode ? "bg-white/5" : "bg-gray-50"
                      )}
                    />
                    <p className={cn("text-[9px] mt-1", darkMode ? "text-gray-600" : "text-gray-400")}>
                      Usa − negativo para registrar un retorno
                    </p>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Medida</label>
                    <select 
                      value={editingRecord.size || '14x17'}
                      onChange={e => setEditingRecord({...editingRecord, size: e.target.value})}
                      style={darkMode ? { colorScheme: 'dark' } : {}}
                      className={cn(
                        "w-full px-4 py-3 rounded-xl border-none focus:ring-2 focus:ring-[#ED1C24]/20 outline-none font-bold appearance-none",
                        darkMode ? "bg-[#16161A] text-white" : "bg-gray-50"
                      )}>
                      <option value="14x17">14x17</option>
                      <option value="8x10">8x10</option>
                      <option value="10x12">10x12</option>
                      <option value="10x14">10x14</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Tipo de Película</label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {(['DIHT', 'DIHL', 'DIML'] as const).map(ft => (
                        <button
                          key={ft}
                          type="button"
                          onClick={() => setEditingRecord({...editingRecord, film_type: ft} as any)}
                          className={cn(
                            "py-3 rounded-xl text-xs font-black transition-all border",
                            (editingRecord as any).film_type === ft || (!( editingRecord as any).film_type && ft === 'DIHT')
                              ? ft === 'DIHL'
                                ? "bg-blue-500/20 text-blue-400 border-blue-500/40 ring-1 ring-blue-500/30"
                                : ft === 'DIML'
                                ? "bg-purple-500/20 text-purple-400 border-purple-500/40 ring-1 ring-purple-500/30"
                                : "bg-[#ED1C24]/15 text-[#ED1C24] border-[#ED1C24]/40 ring-1 ring-[#ED1C24]/30"
                              : (darkMode ? "bg-white/5 text-gray-500 border-white/8 hover:bg-white/10" : "bg-gray-50 text-gray-400 border-gray-200 hover:bg-gray-100")
                          )}
                        >
                          {ft === 'DIHT' ? 'DI-HT' : ft === 'DIHL' ? 'DI-HL' : 'DI-ML'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Lote</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Ej: 72512"
                      value={editingRecord.batch_number || ''}
                      onChange={e => setEditingRecord({...editingRecord, batch_number: e.target.value})}
                      className={cn(
                        "w-full px-4 py-3 rounded-xl border-none focus:ring-2 focus:ring-[#ED1C24]/20 outline-none font-bold",
                        darkMode ? "bg-white/5 text-white" : "bg-gray-50"
                      )}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Fecha de Expiración</label>
                    <input 
                      type="date" 
                      required
                      value={editingRecord.expiry_date || ''}
                      onChange={e => setEditingRecord({...editingRecord, expiry_date: e.target.value})}
                      className={cn(
                        "w-full px-4 py-3 rounded-xl border-none focus:ring-2 focus:ring-[#ED1C24]/20 outline-none font-bold",
                        darkMode ? "bg-white/5 text-white" : "bg-gray-50"
                      )}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Costo Unitario ($)</label>
                    <input 
                      type="number" 
                      step="0.01"
                      placeholder="Ej: 150.50 o -150.50"
                      value={editingRecord.unit_cost || ''}
                      onChange={e => setEditingRecord({...editingRecord, unit_cost: parseFloat(e.target.value) || 0})}
                      className={cn(
                        "w-full px-4 py-3 rounded-xl border-none focus:ring-2 focus:ring-[#ED1C24]/20 outline-none font-bold",
                        darkMode ? "bg-white/5 text-white" : "bg-gray-50"
                      )}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Costo Total Calculado</label>
                    <div className={cn(
                      "w-full px-4 py-3 rounded-xl font-black",
                      (editingRecord as any).is_return ? "text-amber-400" : "text-[#ED1C24]",
                      darkMode ? "bg-white/5" : "bg-gray-50"
                    )}>
                      {(editingRecord as any).is_return
                        ? \`-\$\${(Math.abs(editingRecord.quantity || 0) * Math.abs(editingRecord.unit_cost || 0)).toFixed(2)}\`
                        : \`\$\${((editingRecord.quantity || 0) * (editingRecord.unit_cost || 0)).toFixed(2)}\`
                      }
                    </div>
                  </div>
                </div>
              </div>

              {/* ── ADAPTACIÓN DE MEDIDA ── */}
              {!((editingRecord as any).is_return) && (`;

const newModalForm = `            <form onSubmit={handleSaveRecord} className="p-8 space-y-6">
              <div className="space-y-4">
                {!selectedClient || !editingRecord.id ? (
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Cliente</label>
                    <select 
                      required
                      value={editingRecord.client_id}
                      onChange={e => setEditingRecord({...editingRecord, client_id: parseInt(e.target.value)})}
                      style={darkMode ? { colorScheme: 'dark' } : {}}
                      className={cn(
                        "w-full px-4 py-3 rounded-xl border-none focus:ring-2 focus:ring-[#ED1C24]/20 outline-none font-bold appearance-none",
                        darkMode ? "bg-[#16161A] text-white" : "bg-gray-50"
                      )}>
                      <option value="0">Seleccionar Cliente...</option>
                      {allClients.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Cliente</label>
                    <div className={cn(
                      "w-full px-4 py-3 rounded-xl font-bold",
                      darkMode ? "bg-white/10 text-gray-400" : "bg-gray-100 text-gray-500"
                    )}>
                      {allClients.find(c => c.id === editingRecord.client_id)?.name}
                    </div>
                  </div>
                )}

                {/* Línea de Negocio / Categoría (permite cambiar si está mal asignada) */}
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Línea de Negocio / Categoría</label>
                  <select 
                    value={editingRecord.categoria || activeCategory || 'PELICULAS'}
                    onChange={e => setEditingRecord({ ...editingRecord, categoria: e.target.value })}
                    style={darkMode ? { colorScheme: 'dark' } : {}}
                    className={cn(
                      "w-full px-4 py-3 rounded-xl border-none focus:ring-2 focus:ring-[#ED1C24]/20 outline-none font-bold appearance-none",
                      darkMode ? "bg-[#16161A] text-white" : "bg-gray-50"
                    )}>
                    <option value="PELICULAS">PELÍCULAS</option>
                    <option value="REPUESTOS">REPUESTOS</option>
                    <option value="SERVICIOS">SERVICIOS</option>
                    <option value="EQUIPOS">EQUIPOS</option>
                    <option value="ACCESORIOS">ACCESORIOS</option>
                    <option value="QUIMICOS">QUÍMICOS</option>
                    <option value="MANTENIMIENTO">MANTENIMIENTO</option>
                    <option value="CONTRASTES">CONTRASTES</option>
                    <option value="ALIANZA">ALIANZA</option>
                    <option value="INTERESES">INTERESES</option>
                    <option value="MAMOTOME">MAMOTOME</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Fecha de Pedido</label>
                    <input 
                      type="date" 
                      required
                      value={editingRecord.order_date || ''}
                      onChange={e => setEditingRecord({...editingRecord, order_date: e.target.value})}
                      className={cn(
                        "w-full px-4 py-3 rounded-xl border-none focus:ring-2 focus:ring-[#ED1C24]/20 outline-none font-bold",
                        darkMode ? "bg-white/5 text-white" : "bg-gray-50"
                      )}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Nº Factura</label>
                    <input 
                      type="text" 
                      placeholder="Ej: 001-001-000123"
                      value={editingRecord.invoice_number || ''}
                      onChange={e => setEditingRecord({...editingRecord, invoice_number: e.target.value})}
                      className={cn(
                        "w-full px-4 py-3 rounded-xl border-none focus:ring-2 focus:ring-[#ED1C24]/20 outline-none font-bold",
                        darkMode ? "bg-white/5 text-white" : "bg-gray-50"
                      )}
                    />
                  </div>
                </div>

                {/* Campos dinámicos según Categoría */}
                {((editingRecord.categoria || activeCategory || 'PELICULAS') === 'PELICULAS') ? (
                  <>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">
                          Cantidad (Cajas)
                          {(editingRecord as any).is_return && (
                            <span className="ml-2 px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[9px] font-black normal-case">retorno</span>
                          )}
                        </label>
                        <input
                          type="text"
                          inputMode="numeric"
                          required
                          placeholder="Ej: 3 o -3 para retorno"
                          value={(editingRecord as any).is_return ? -(editingRecord.quantity || 0) : (editingRecord.quantity || '')}
                          onChange={e => {
                            const raw = e.target.value;
                            const val = parseInt(raw);
                            if (raw === '' || raw === '-') { setEditingRecord({ ...editingRecord, quantity: 0, is_return: raw === '-' ? true : undefined } as any); return; }
                            if (isNaN(val)) return;
                            setEditingRecord({ ...editingRecord, quantity: Math.abs(val), is_return: val < 0 ? true : undefined } as any);
                          }}
                          className={cn(
                            "w-full px-4 py-3 rounded-xl border-none focus:ring-2 outline-none font-bold",
                            (editingRecord as any).is_return
                              ? "focus:ring-amber-400/30 ring-1 ring-amber-500/50 text-amber-400"
                              : "focus:ring-[#ED1C24]/20",
                            darkMode ? "bg-white/5" : "bg-gray-50"
                          )}
                        />
                        <p className={cn("text-[9px] mt-1", darkMode ? "text-gray-600" : "text-gray-400")}>
                          Usa − negativo para registrar un retorno
                        </p>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Medida</label>
                        <select 
                          value={editingRecord.size || '14x17'}
                          onChange={e => setEditingRecord({...editingRecord, size: e.target.value})}
                          style={darkMode ? { colorScheme: 'dark' } : {}}
                          className={cn(
                            "w-full px-4 py-3 rounded-xl border-none focus:ring-2 focus:ring-[#ED1C24]/20 outline-none font-bold appearance-none",
                            darkMode ? "bg-[#16161A] text-white" : "bg-gray-50"
                          )}>
                          <option value="14x17">14x17</option>
                          <option value="8x10">8x10</option>
                          <option value="10x12">10x12</option>
                          <option value="10x14">10x14</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Tipo de Película</label>
                        <div className="grid grid-cols-3 gap-1.5">
                          {(['DIHT', 'DIHL', 'DIML'] as const).map(ft => (
                            <button
                              key={ft}
                              type="button"
                              onClick={() => setEditingRecord({...editingRecord, film_type: ft} as any)}
                              className={cn(
                                "py-3 rounded-xl text-xs font-black transition-all border",
                                (editingRecord as any).film_type === ft || (!( editingRecord as any).film_type && ft === 'DIHT')
                                  ? ft === 'DIHL'
                                    ? "bg-blue-500/20 text-blue-400 border-blue-500/40 ring-1 ring-blue-500/30"
                                    : ft === 'DIML'
                                    ? "bg-purple-500/20 text-purple-400 border-purple-500/40 ring-1 ring-purple-500/30"
                                    : "bg-[#ED1C24]/15 text-[#ED1C24] border-[#ED1C24]/40 ring-1 ring-[#ED1C24]/30"
                                  : (darkMode ? "bg-white/5 text-gray-500 border-white/8 hover:bg-white/10" : "bg-gray-50 text-gray-400 border-gray-200 hover:bg-gray-100")
                              )}
                            >
                              {ft === 'DIHT' ? 'DI-HT' : ft === 'DIHL' ? 'DI-HL' : 'DI-ML'}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Lote</label>
                        <input 
                          type="text" 
                          required
                          placeholder="Ej: 72512"
                          value={editingRecord.batch_number || ''}
                          onChange={e => setEditingRecord({...editingRecord, batch_number: e.target.value})}
                          className={cn(
                            "w-full px-4 py-3 rounded-xl border-none focus:ring-2 focus:ring-[#ED1C24]/20 outline-none font-bold",
                            darkMode ? "bg-white/5 text-white" : "bg-gray-50"
                          )}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Fecha de Expiración</label>
                        <input 
                          type="date" 
                          required
                          value={editingRecord.expiry_date || ''}
                          onChange={e => setEditingRecord({...editingRecord, expiry_date: e.target.value})}
                          className={cn(
                            "w-full px-4 py-3 rounded-xl border-none focus:ring-2 focus:ring-[#ED1C24]/20 outline-none font-bold",
                            darkMode ? "bg-white/5 text-white" : "bg-gray-50"
                          )}
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">
                          Cantidad
                          {(editingRecord as any).is_return && (
                            <span className="ml-2 px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[9px] font-black normal-case">retorno</span>
                          )}
                        </label>
                        <input
                          type="text"
                          inputMode="numeric"
                          required
                          placeholder="Ej: 1 o -1"
                          value={(editingRecord as any).is_return ? -(editingRecord.quantity || 0) : (editingRecord.quantity || '')}
                          onChange={e => {
                            const raw = e.target.value;
                            const val = parseInt(raw);
                            if (raw === '' || raw === '-') { setEditingRecord({ ...editingRecord, quantity: 0, is_return: raw === '-' ? true : undefined } as any); return; }
                            if (isNaN(val)) return;
                            setEditingRecord({ ...editingRecord, quantity: Math.abs(val), is_return: val < 0 ? true : undefined } as any);
                          }}
                          className={cn(
                            "w-full px-4 py-3 rounded-xl border-none focus:ring-2 outline-none font-bold",
                            (editingRecord as any).is_return
                              ? "focus:ring-amber-400/30 ring-1 ring-amber-500/50 text-amber-400"
                              : "focus:ring-[#ED1C24]/20",
                            darkMode ? "bg-white/5" : "bg-gray-50"
                          )}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Código de Producto</label>
                        <input 
                          type="text" 
                          placeholder="Ej: GE5260436"
                          value={(editingRecord as any).product_code || ''}
                          onChange={e => setEditingRecord({...editingRecord, product_code: e.target.value} as any)}
                          className={cn(
                            "w-full px-4 py-3 rounded-xl border-none focus:ring-2 focus:ring-[#ED1C24]/20 outline-none font-bold font-mono",
                            darkMode ? "bg-white/5 text-white" : "bg-gray-50"
                          )}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Lote</label>
                        <input 
                          type="text" 
                          placeholder="Ej: N/A"
                          value={editingRecord.batch_number || ''}
                          onChange={e => setEditingRecord({...editingRecord, batch_number: e.target.value})}
                          className={cn(
                            "w-full px-4 py-3 rounded-xl border-none focus:ring-2 focus:ring-[#ED1C24]/20 outline-none font-bold",
                            darkMode ? "bg-white/5 text-white" : "bg-gray-50"
                          )}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Producto / Descripción</label>
                      <input 
                        type="text" 
                        placeholder="Ej: PSD DR 45 SPARE PART"
                        value={(editingRecord as any).product_name || editingRecord.size || ''}
                        onChange={e => setEditingRecord({...editingRecord, product_name: e.target.value, size: e.target.value} as any)}
                        className={cn(
                          "w-full px-4 py-3 rounded-xl border-none focus:ring-2 focus:ring-[#ED1C24]/20 outline-none font-bold",
                          darkMode ? "bg-white/5 text-white" : "bg-gray-50"
                        )}
                      />
                    </div>
                  </>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Costo Unitario ($)</label>
                    <input 
                      type="number" 
                      step="0.01"
                      placeholder="Ej: 150.50 o -150.50"
                      value={editingRecord.unit_cost || ''}
                      onChange={e => setEditingRecord({...editingRecord, unit_cost: parseFloat(e.target.value) || 0})}
                      className={cn(
                        "w-full px-4 py-3 rounded-xl border-none focus:ring-2 focus:ring-[#ED1C24]/20 outline-none font-bold",
                        darkMode ? "bg-white/5 text-white" : "bg-gray-50"
                      )}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Costo Total Calculado</label>
                    <div className={cn(
                      "w-full px-4 py-3 rounded-xl font-black",
                      (editingRecord as any).is_return ? "text-amber-400" : "text-[#ED1C24]",
                      darkMode ? "bg-white/5" : "bg-gray-50"
                    )}>
                      {(editingRecord as any).is_return
                        ? \`-\$\${(Math.abs(editingRecord.quantity || 0) * Math.abs(editingRecord.unit_cost || 0)).toFixed(2)}\`
                        : \`\$\${((editingRecord.quantity || 0) * (editingRecord.unit_cost || 0)).toFixed(2)}\`
                      }
                    </div>
                  </div>
                </div>
              </div>

              {/* ── ADAPTACIÓN DE MEDIDA — ONLY FOR PELÍCULAS ── */}
              {((editingRecord.categoria || activeCategory || 'PELICULAS') === 'PELICULAS') && !((editingRecord as any).is_return) && (`;

if (file.includes(oldModalForm)) {
  file = file.replace(oldModalForm, newModalForm);
  console.log('2. Modal form replaced successfully');
} else {
  console.log('2. Modal form pattern not found');
}

fs.writeFileSync('src/App.tsx', file.replace(/\n/g, '\r\n'), 'utf8');
