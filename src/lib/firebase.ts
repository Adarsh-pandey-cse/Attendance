// src/lib/firebase.ts
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  "projectId": "studio-4204071461-4b4fd",
  "appId": "1:50095997739:web:044526670c47c1ae2b7b6e",
  "apiKey": "AIzaSyCLaB1FSuzGL303IgjtPiEjMVmPTz5_2Mk",
  "authDomain": "studio-4204071461-4b4fd.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "50095997739"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { app, db };
