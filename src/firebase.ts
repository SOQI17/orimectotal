import { initializeApp } from "firebase/app";
import { 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager 
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCFvpZuhpon8j2nCWUXFYAGwF0xzaCmlSI",
  authDomain: "orimectotal.firebaseapp.com",
  projectId: "orimectotal",
  storageBucket: "orimectotal.firebasestorage.app",
  messagingSenderId: "1053167340257",
  appId: "1:1053167340257:web:688222e086e3355dce05a0"
};

const app = initializeApp(firebaseConfig);
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
});
