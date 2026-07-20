const fs = require('fs');

let file = fs.readFileSync('src/App.tsx', 'utf8').replace(/\r\n/g, '\n');

// 1. Dashboard Top Clientes card row click
const oldDashTopClientClick = `                        onClick={() => {
                          const c = allClients.find(x => x.id === client.id);
                          if (c) setClientPreviewModal({ client: c, rank: idx + 1, m2: client.m2, cajas: client.value });
                        }}`;

const newDashTopClientClick = `                        onClick={() => {
                          const c = allClients.find(x => x.id === client.id);
                          if (c) {
                            setSelectedClient(c);
                            setView('clients');
                          }
                        }}`;

if (file.includes(oldDashTopClientClick)) {
  file = file.replace(oldDashTopClientClick, newDashTopClientClick);
  console.log('1. Dashboard Top Clientes row click updated to direct navigation');
} else {
  console.log('1. Dashboard Top Clientes row click pattern not found');
}

// 2. Top Clientes Modal card layout row click
const oldModalCardClick = `                          onClick={() => { const c = allClients.find(x => x.id === client.id); if (c) setClientPreviewModal({ client: c, rank: idx+1, m2: client.m2, cajas: client.value }); }}`;
const newModalCardClick = `                          onClick={() => { const c = allClients.find(x => x.id === client.id); if (c) { setSelectedClient(c); setView('clients'); setShowTopClientsModal(false); } }}`;

if (file.includes(oldModalCardClick)) {
  file = file.replace(oldModalCardClick, newModalCardClick);
  console.log('2. Top Clientes Modal card click updated to direct navigation');
} else {
  console.log('2. Top Clientes Modal card click pattern not found');
}

// 3. Top Clientes Modal table layout row click
const oldModalTableClick = `                            onClick={() => { const c = allClients.find(x => x.id === client.id); if (c) setClientPreviewModal({ client: c, rank: idx+1, m2: client.m2, cajas: client.value }); }}`;
const newModalTableClick = `                            onClick={() => { const c = allClients.find(x => x.id === client.id); if (c) { setSelectedClient(c); setView('clients'); setShowTopClientsModal(false); } }}`;

if (file.includes(oldModalTableClick)) {
  file = file.replace(oldModalTableClick, newModalTableClick);
  console.log('3. Top Clientes Modal table click updated to direct navigation');
} else {
  console.log('3. Top Clientes Modal table click pattern not found');
}

fs.writeFileSync('src/App.tsx', file.replace(/\n/g, '\r\n'), 'utf8');
