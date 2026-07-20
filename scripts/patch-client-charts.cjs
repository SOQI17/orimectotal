const fs = require('fs');

let file = fs.readFileSync('src/App.tsx', 'utf8').replace(/\r\n/g, '\n');

const oldChartsSection = `                  {/* Charts Section */}
                  <div className="grid grid-cols-2 gap-5">
                    <div className={cn(
                      "rounded-xl p-6 border transition-colors duration-300",
                      darkMode ? "bg-[#16161A] border-white/8" : "bg-white border-gray-200/70 shadow-sm"
                    )}>
                      <h3 className={cn("text-[10px] font-bold uppercase tracking-wider mb-5", darkMode ? "text-gray-500" : "text-gray-400")}>Tendencia de Pedidos</h3>
                      <div className="h-44 min-w-0" style={{minHeight: 176}}>
                        <ResponsiveContainer width="100%" height={176}>
                          <LineChart data={filteredClientConsumption.slice(0, 8).reverse()}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? "#222" : "#F0F0F0"} />
                            <XAxis dataKey="order_date" hide />
                            <Tooltip
                              contentStyle={darkMode
                                ? { backgroundColor: '#16161A', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', borderRadius: '10px', fontSize: '11px' }
                                : { borderRadius: '10px', fontSize: '11px', border: '1px solid #e5e7eb' }}
                              itemStyle={darkMode ? { color: '#fff' } : {}}
                            />
                            <Line type="monotone" dataKey="quantity" stroke="#ED1C24" strokeWidth={2.5} dot={{r: 4, fill: '#ED1C24', strokeWidth: 0}} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div className={cn(
                      "rounded-xl p-6 border transition-colors duration-300",
                      darkMode ? "bg-[#16161A] border-white/8" : "bg-white border-gray-200/70 shadow-sm"
                    )}>
                      <h3 className={cn("text-[10px] font-bold uppercase tracking-wider mb-5", darkMode ? "text-gray-500" : "text-gray-400")}>Stock por Medida (Cajas)</h3>
                      <div className="h-44 min-w-0" style={{minHeight: 176}}>
                        <ResponsiveContainer width="100%" height={176}>
                          <BarChart data={sizeDistribution} layout="vertical">
                            <XAxis type="number" hide />
                            <YAxis
                              dataKey="name"
                              type="category"
                              axisLine={false}
                              tickLine={false}
                              tick={{fontSize: 10, fontWeight: '600', fill: darkMode ? '#777' : '#888'}}
                              width={70}
                            />
                            <Tooltip
                              cursor={{fill: 'transparent'}}
                              contentStyle={darkMode
                                ? { backgroundColor: '#16161A', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', borderRadius: '10px', fontSize: '11px' }
                                : { borderRadius: '10px', fontSize: '11px', border: '1px solid #e5e7eb' }}
                              itemStyle={darkMode ? { color: '#fff' } : {}}
                            />
                            <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={16}>
                              {sizeDistribution.map((entry, index) => (
                                <Cell key={\`cell-\${index}\`} fill={index % 2 === 0 ? '#ED1C24' : (darkMode ? '#3a3a3a' : '#D1D5DB')} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>`;

const newChartsSection = `                  {/* Charts Section */}
                  <div className="grid grid-cols-2 gap-5 mb-8">
                    {activeCategory === 'PELICULAS' ? (
                      <>
                        <div className={cn(
                          "rounded-xl p-6 border transition-colors duration-300",
                          darkMode ? "bg-[#16161A] border-white/8" : "bg-white border-gray-200/70 shadow-sm"
                        )}>
                          <h3 className={cn("text-[10px] font-bold uppercase tracking-wider mb-5", darkMode ? "text-gray-500" : "text-gray-400")}>Tendencia de Pedidos (Cajas)</h3>
                          <div className="h-44 min-w-0" style={{minHeight: 176}}>
                            <ResponsiveContainer width="100%" height={176}>
                              <LineChart data={filteredClientConsumption.slice(0, 8).reverse()}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? "#222" : "#F0F0F0"} />
                                <XAxis dataKey="order_date" hide />
                                <Tooltip
                                  contentStyle={darkMode
                                    ? { backgroundColor: '#16161A', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', borderRadius: '10px', fontSize: '11px' }
                                    : { borderRadius: '10px', fontSize: '11px', border: '1px solid #e5e7eb' }}
                                  itemStyle={darkMode ? { color: '#fff' } : {}}
                                />
                                <Line type="monotone" dataKey="quantity" stroke="#ED1C24" strokeWidth={2.5} dot={{r: 4, fill: '#ED1C24', strokeWidth: 0}} />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        </div>

                        <div className={cn(
                          "rounded-xl p-6 border transition-colors duration-300",
                          darkMode ? "bg-[#16161A] border-white/8" : "bg-white border-gray-200/70 shadow-sm"
                        )}>
                          <h3 className={cn("text-[10px] font-bold uppercase tracking-wider mb-5", darkMode ? "text-gray-500" : "text-gray-400")}>Stock por Medida (Cajas)</h3>
                          <div className="h-44 min-w-0" style={{minHeight: 176}}>
                            <ResponsiveContainer width="100%" height={176}>
                              <BarChart data={sizeDistribution} layout="vertical">
                                <XAxis type="number" hide />
                                <YAxis
                                  dataKey="name"
                                  type="category"
                                  axisLine={false}
                                  tickLine={false}
                                  tick={{fontSize: 10, fontWeight: '600', fill: darkMode ? '#777' : '#888'}}
                                  width={70}
                                />
                                <Tooltip
                                  cursor={{fill: 'transparent'}}
                                  contentStyle={darkMode
                                    ? { backgroundColor: '#16161A', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', borderRadius: '10px', fontSize: '11px' }
                                    : { borderRadius: '10px', fontSize: '11px', border: '1px solid #e5e7eb' }}
                                  itemStyle={darkMode ? { color: '#fff' } : {}}
                                />
                                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={16}>
                                  {sizeDistribution.map((entry, index) => (
                                    <Cell key={\`cell-\${index}\`} fill={index % 2 === 0 ? '#ED1C24' : (darkMode ? '#3a3a3a' : '#D1D5DB')} />
                                  ))}
                                </Bar>
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        {/* Non-PELICULAS: Facturación Mensual ($) */}
                        <div className={cn(
                          "rounded-xl p-6 border transition-colors duration-300",
                          darkMode ? "bg-[#16161A] border-white/8" : "bg-white border-gray-200/70 shadow-sm"
                        )}>
                          <h3 className={cn("text-[10px] font-bold uppercase tracking-wider mb-5 flex items-center justify-between", darkMode ? "text-gray-500" : "text-gray-400")}>
                            <span>Facturación Mensual ($)</span>
                            <span className="text-emerald-500 text-xs font-mono font-bold">\$\${clientMetrics.total.toLocaleString()}</span>
                          </h3>
                          <div className="h-44 min-w-0" style={{minHeight: 176}}>
                            {clientMonthlyRevenue.length > 0 ? (
                              <ResponsiveContainer width="100%" height={176}>
                                <BarChart data={clientMonthlyRevenue}>
                                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? "#222" : "#F0F0F0"} />
                                  <XAxis dataKey="month" tick={{ fontSize: 9, fill: darkMode ? '#888' : '#666' }} axisLine={false} tickLine={false} />
                                  <YAxis hide />
                                  <Tooltip
                                    formatter={(val: number) => [\`\$\${val.toLocaleString()}\`, 'Facturado']}
                                    contentStyle={darkMode
                                      ? { backgroundColor: '#16161A', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', borderRadius: '10px', fontSize: '11px' }
                                      : { borderRadius: '10px', fontSize: '11px', border: '1px solid #e5e7eb' }}
                                  />
                                  <Bar dataKey="total" fill="#10B981" radius={[4, 4, 0, 0]} />
                                </BarChart>
                              </ResponsiveContainer>
                            ) : (
                              <div className="h-full flex items-center justify-center text-xs text-gray-500">Sin compras registradas</div>
                            )}
                          </div>
                        </div>

                        {/* Non-PELICULAS: Top Productos / Repuestos ($) */}
                        <div className={cn(
                          "rounded-xl p-6 border transition-colors duration-300",
                          darkMode ? "bg-[#16161A] border-white/8" : "bg-white border-gray-200/70 shadow-sm"
                        )}>
                          <h3 className={cn("text-[10px] font-bold uppercase tracking-wider mb-5", darkMode ? "text-gray-500" : "text-gray-400")}>Top Productos / Repuestos ($)</h3>
                          <div className="h-44 min-w-0" style={{minHeight: 176}}>
                            {clientTopProducts.length > 0 ? (
                              <ResponsiveContainer width="100%" height={176}>
                                <BarChart data={clientTopProducts} layout="vertical">
                                  <XAxis type="number" hide />
                                  <YAxis
                                    dataKey="name"
                                    type="category"
                                    axisLine={false}
                                    tickLine={false}
                                    width={140}
                                    tick={{ fontSize: 9, fill: darkMode ? '#aaa' : '#444', fontWeight: 600 }}
                                  />
                                  <Tooltip
                                    formatter={(val: number) => [\`\$\${val.toLocaleString()}\`, 'Inversión Total']}
                                    contentStyle={darkMode
                                      ? { backgroundColor: '#16161A', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', borderRadius: '10px', fontSize: '11px' }
                                      : { borderRadius: '10px', fontSize: '11px', border: '1px solid #e5e7eb' }}
                                  />
                                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                                    {clientTopProducts.map((entry, index) => (
                                      <Cell key={\`cell-\${index}\`} fill={index === 0 ? '#3B82F6' : index === 1 ? '#8B5CF6' : darkMode ? '#333' : '#E5E7EB'} />
                                    ))}
                                  </Bar>
                                </BarChart>
                              </ResponsiveContainer>
                            ) : (
                              <div className="h-full flex items-center justify-center text-xs text-gray-500">Sin productos registrados</div>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </div>`;

if (file.includes(oldChartsSection)) {
  file = file.replace(oldChartsSection, newChartsSection);
  console.log('Charts Section replaced successfully');
} else {
  console.log('Charts Section pattern not found');
}

fs.writeFileSync('src/App.tsx', file.replace(/\n/g, '\r\n'), 'utf8');
