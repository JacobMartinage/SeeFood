// Import the Firebase SDK using require (CommonJS)
const { initializeApp } = require("firebase/app");
const { getFirestore } = require("firebase/firestore");
// const { getAnalytics } = require("firebase/analytics"); // Optional, only for browser environments

// Your Firebase configuration


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Optionally check for browser environment if needed
if (typeof window !== "undefined") {
  // const analytics = getAnalytics(app);
}

// Export Firebase services
module.exports = { app, db };