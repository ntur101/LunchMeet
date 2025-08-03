import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "REDACTED_API_KEY",
  authDomain: "lunchmeet-f4c94.firebaseapp.com",
  databaseURL: "https://lunchmeet-f4c94-default-rtdb.firebaseio.com/",
  projectId: "lunchmeet-f4c94",
  storageBucket: "lunchmeet-f4c94.firebasestorage.app",
  messagingSenderId: "347739190424",
  appId: "1:347739190424:web:b777c0995c047ea7d64ced",
  measurementId: "G-HVQPND630S"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Realtime Database and get a reference to the service
export const database = getDatabase(app);

// Auto sign in anonymously when the app starts
export const initializeAuth = async () => {
  try {
    const userCredential = await signInAnonymously(auth);
    console.log('Signed in anonymously:', userCredential.user.uid);
    return userCredential.user;
  } catch (error) {
    console.error('Error signing in anonymously:', error);
    throw error;
  }
};
