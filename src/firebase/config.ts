import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDiPniLx-sfFhKgmehftHKfsBVCK7hsR5M",
  authDomain: "orimec-total.firebaseapp.com",
  projectId: "orimec-total",
  storageBucket: "orimec-total.firebasestorage.app",
  messagingSenderId: "356698042752",
  appId: "1:356698042752:web:04afe503f7650af9a71165"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Anonymous Auth Function
export const loginAnonymously = async () => {
  try {
    const userCredential = await signInAnonymously(auth);
    console.log("Logged in as:", userCredential.user.uid);
    return userCredential.user;
  } catch (error) {
    console.error("Anonymous login failed:", error);
    throw error;
  }
};

export { auth, db };
