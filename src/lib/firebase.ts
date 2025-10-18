// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBT5G_4SWXxLKDoCWqxTSVxWUGgWMbNwLw",
  authDomain: "clonetoast.firebaseapp.com",
  projectId: "clonetoast",
  storageBucket: "clonetoast.firebasestorage.app",
  messagingSenderId: "559318580715",
  appId: "1:559318580715:web:9343b75464f579d9962dae"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize Firebase Storage and get a reference to the service
export const storage = getStorage(app);

export default app;

