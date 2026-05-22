import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDlkJk6KIYH0sEJG8z3BuRWmajcQ-pDMY8",
  authDomain: "mangazone-b2c8d.firebaseapp.com",
  projectId: "mangazone-b2c8d",
  storageBucket: "mangazone-b2c8d.firebasestorage.app",
  messagingSenderId: "19327260214",
  appId: "1:19327260214:web:b4d901bd83331d78626a97",
  measurementId: "G-9HPL716YV8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
