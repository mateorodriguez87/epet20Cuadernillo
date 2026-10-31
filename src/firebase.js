import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCDU-oSlCXfr_KNqub0zHxMuXGA6pHDeOc",
  authDomain: "cuadernilloepet20.firebaseapp.com",
  projectId: "cuadernilloepet20",
  storageBucket: "cuadernilloepet20.firebasestorage.app",
  messagingSenderId: "60275070555",
  appId: "1:60275070555:web:b62d5aca4ef62979c9f81a",
  measurementId: "G-SMZ5ZCBS8X"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

console.log("Firebase Auth:", auth.config.apiKey);

export { db, auth };