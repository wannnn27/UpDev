import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration from your Firebase project
const firebaseConfig = {
  apiKey: "AIzaSyAuxkGlwy4gVTpo43k4qnZ5CqTx8EP8sLo",
  authDomain: "productivity-apps-3ecb4.firebaseapp.com",
  projectId: "productivity-apps-3ecb4",
  storageBucket: "productivity-apps-3ecb4.appspot.com",
  messagingSenderId: "875040862149",
  appId: "1:875040862149:web:46f88b73cd1787e75725ac",
  measurementId: "G-8VHHL0R6HE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = firebaseConfig.appId;

export { db, auth, appId };
