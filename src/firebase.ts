import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDiPniLx-sfFhKgmehftHKfsBVCK7hsR5M",
  authDomain: "orimec-total.firebaseapp.com",
  projectId: "orimec-total",
  storageBucket: "orimec-total.firebasestorage.app",
  messagingSenderId: "356698042752",
  appId: "1:356698042752:web:04afe503f7650af9a71165"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
