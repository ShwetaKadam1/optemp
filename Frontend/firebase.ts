// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB-ZBKlSK_WXLGuB5uE2e7F1FsqQPBSwOg",
  authDomain: "empsystem-bd5e4.firebaseapp.com",
  projectId: "empsystem-bd5e4",
  storageBucket: "empsystem-bd5e4.firebasestorage.app",
  messagingSenderId: "596148796969",
  appId: "1:596148796969:web:59e21df7090a3f0bd42638",
  measurementId: "G-S72WE1820J"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const analytics = typeof window !== "undefined" ? getAnalytics(app) : null;


const analytics = getAnalytics(app);