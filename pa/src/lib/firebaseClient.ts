import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC3rB_Ljk61AtpH6sgrhv1q_gyQEBbmziU",
  authDomain: "prontoatendimento-5a913.firebaseapp.com",
  projectId: "prontoatendimento-5a913",
  storageBucket: "prontoatendimento-5a913.firebasestorage.app",
  messagingSenderId: "261942385773",
  appId: "1:261942385773:web:c1f96813c86c3894e3f364",
  measurementId: "G-875W18VY0Y",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Initialize Cloud Firestore
export const db = getFirestore(app);

export default app;
