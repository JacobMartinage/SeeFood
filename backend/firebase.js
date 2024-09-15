// Import the Firebase SDK using require (CommonJS)
const { initializeApp } = require("firebase/app");
const { getFirestore } = require("firebase/firestore");
// const { getAnalytics } = require("firebase/analytics"); // Optional, only for browser environments

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAIMNbU4PsyZj9LYNAmMQ_YhSYBb-UbGk8",
  authDomain: "seefoodd-4f019.firebaseapp.com",
  projectId: "seefoodd-4f019",
  storageBucket: "seefoodd-4f019.appspot.com",
  messagingSenderId: "825603661393",
  appId: "1:825603661393:web:0f4384ba3e0d0581f96270",
  measurementId: "G-2QZ88FX1SF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Optionally check for browser environment if needed
if (typeof window !== "undefined") {
  // const analytics = getAnalytics(app);
}

// Export Firebase services
module.exports = { app, db };