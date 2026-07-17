import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const app = express();
const PORT = 3000;

// Initialize Firebase Admin
const serviceAccountPath = path.join(process.cwd(), "serviceAccountKey.json");
if (fs.existsSync(serviceAccountPath)) {
  try {
    initializeApp({
      credential: cert(serviceAccountPath)
    });
    console.log("Firebase Admin initialized");
  } catch (error) {
    console.error("Error initializing Firebase Admin:", error);
  }
} else {
  console.warn("serviceAccountKey.json not found. Firebase Admin not initialized.");
}

const db = getApps().length > 0 ? getFirestore() : null;

// Mock Data Fallback
const mockClients = [
  { id: "1", name: "Hospital Central (DEMO)", city: "Ciudad de México", ruc_id: "RUC-123", contact: "Dr. Demo" },
  { id: "2", name: "Clínica Santa Fe (DEMO)", city: "Monterrey", ruc_id: "RUC-456", contact: "Lic. Demo" }
];

const mockConsumption = [
  { id: "c1", client_id: "1", order_date: "2024-05-10", quantity: 15, size: "14x17", batch_number: "LOT-001", expiry_date: "2026-12-31" },
  { id: "c2", client_id: "1", order_date: "2024-04-12", quantity: 18, size: "14x17", batch_number: "LOT-002", expiry_date: "2026-12-31" }
];

const mockLoyalty = [
  { id: "1", name: "Hospital Central (DEMO)", current: 15, average: 18.2, status: "warning", trend: -17.5 },
  { id: "2", name: "Clínica Santa Fe (DEMO)", current: 10, average: 9.5, status: "stable", trend: 5.2 }
];

app.use(express.json());

// Set headers to allow Firebase auth popups to communicate
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  next();
});

// API Routes (Now using Firestore via Admin SDK with Mock Fallback)
app.get("/api/clients", async (req, res) => {
  if (!db) return res.json(mockClients);
  
  try {
    const snapshot = await db.collection("clientes").get();
    const clients = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(clients);
  } catch (error) {
    res.json(mockClients);
  }
});

app.get("/api/consumption", async (req, res) => {
  if (!db) {
    const { clientId } = req.query;
    if (clientId) return res.json(mockConsumption.filter(c => c.client_id === clientId));
    return res.json(mockConsumption);
  }
  
  const { clientId } = req.query;
  try {
    let query: any = db.collection("consumos");
    if (clientId) {
      query = query.where("client_id", "==", clientId);
    }
    const snapshot = await query.get();
    const consumption = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(consumption);
  } catch (error) {
    res.json(mockConsumption);
  }
});

app.get("/api/analytics/loyalty", async (req, res) => {
  if (!db) return res.json(mockLoyalty);
  
  try {
    const snapshot = await db.collection("loyalty").get();
    const loyalty = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(loyalty);
  } catch (error) {
    res.json(mockLoyalty);
  }
});

// Vite middleware for development
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(process.cwd(), "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(process.cwd(), "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
