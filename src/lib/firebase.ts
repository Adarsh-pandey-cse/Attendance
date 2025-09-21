// src/lib/firebase.ts
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  "projectId": "studio-4204071461-4b4fd",
  "appId": "1:50095997739:web:044526670c47c1ae2b7b6e",
  "apiKey": "AIzaSyCLaB1FSuzGL303IgjtPiEjMVmPTz5_2Mk",
  "authDomain": "studio-4204071461-4b4fd.firebaseapp.com",
  "storageBucket": "studio-4204071461-4b4fd.appspot.com",
  "measurementId": "",
  "messagingSenderId": "50095997739"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const storage = getStorage(app);

// Enable offline persistence
enableIndexedDbPersistence(db)
  .catch((err) => {
    if (err.code == 'failed-precondition') {
      // Multiple tabs open, persistence can only be enabled in one tab at a time.
      console.warn('Firebase persistence failed: multiple tabs open.');
    } else if (err.code == 'unimplemented') {
      // The current browser does not support all of the features required to enable persistence
      console.warn('Firebase persistence failed: browser does not support it.');
    }
  });


export { app, db, storage };
