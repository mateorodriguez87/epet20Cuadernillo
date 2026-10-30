// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCDU-oSlCXfr_KNqub0zHxMuXGA6pHDeOc",
  authDomain: "cuadernilloepet20.firebaseapp.com",
  projectId: "cuadernilloepet20",
  storageBucket: "cuadernilloepet20.firebasestorage.app",
  messagingSenderId: "60275075055",
  appId: "1:60275075055:web:b62d5aca4ef62979c9f81a",
  measurementId: "G-SMZ5ZCBS8X"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);