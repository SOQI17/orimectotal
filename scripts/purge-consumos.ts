import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import path from 'path';

const serviceAccount = path.join(process.cwd(), 'serviceAccountKey.json');
initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

async function purgeAllConsumos() {
  console.log('Fetching all documents from "consumos" collection...');
  const snapshot = await db.collection('consumos').get();
  console.log(`Found ${snapshot.size} documents in "consumos". Starting bulk delete...`);
  
  if (snapshot.empty) {
    console.log('Collection "consumos" is already empty!');
    return;
  }

  const bulkWriter = db.bulkWriter();
  let deletedCount = 0;

  snapshot.docs.forEach((doc) => {
    bulkWriter.delete(doc.ref);
    deletedCount++;
    if (deletedCount % 2000 === 0) {
      console.log(`Queued ${deletedCount} / ${snapshot.size} deletions...`);
    }
  });

  await bulkWriter.close();
  console.log(`✅ SUCCESS: Deleted all ${deletedCount} documents from "consumos" in Firestore!`);
}

purgeAllConsumos().catch((err) => {
  console.error('❌ Error purging consumos:', err);
  process.exit(1);
});
