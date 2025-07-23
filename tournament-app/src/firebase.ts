// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCDvOgg-Hacwo6375_xg0KYH8HK7jNbszU",
  authDomain: "grumble-5885f.firebaseapp.com",
  projectId: "grumble-5885f",
  storageBucket: "grumble-5885f.firebasestorage.app",
  messagingSenderId: "1043657844988",
  appId: "1:1043657844988:web:1648f6a4c6463049c64f79",
  measurementId: "G-YCK6J9631D"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
