// src/firebaseConfig.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Your web app's Firebase configuration
// For Firebase JavaScript SDK v7.20.0 and later, `measurementId` is optional
const firebaseConfig = {
  apiKey: "AIzaSyAcQkQI6n1X3-l9HZItqFKse6hj3wurk8Q",
  authDomain: "magicalpromptconverterapp.firebaseapp.com",
  projectId: "magicalpromptconverterapp",
  storageBucket: "magicalpromptconverterapp.firebasestorage.app",
  messagingSenderId: "902684554190",
  appId: "1:902684554190:web:63982ac101258910a7319f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);