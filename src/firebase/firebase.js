import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyBcDKkvy-iySYsOWqaVebOTYPgCT58ku4c",
    authDomain: "quikserv-d7594.firebaseapp.com",
    projectId: "quikserv-d7594",
    storageBucket: "quikserv-d7594.firebasestorage.app",
    messagingSenderId: "369177038692",
    appId: "1:369177038692:web:108445e16990578b9ab471",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
