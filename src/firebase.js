import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyCUMgQf-oeKZbUa8gcyuZD82TwhVcEIPhc",
    authDomain: "pet-adoption-fbd3f.firebaseapp.com",
    projectId: "pet-adoption-fbd3f",
    storageBucket: "pet-adoption-fbd3f.firebasestorage.app",
    messagingSenderId: "421600561838",
    appId: "1:421600561838:web:780bd2549c4ad17fa1fb3f"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);