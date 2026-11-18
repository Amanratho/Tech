const admin = require('firebase-admin');

let serviceAccount;

// 1. Try loading from Render / server Environment Variable (Secure for production)
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  try {
    serviceAccount = typeof process.env.FIREBASE_SERVICE_ACCOUNT === 'string'
      ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
      : process.env.FIREBASE_SERVICE_ACCOUNT;
  } catch (err) {
    console.error("Error parsing FIREBASE_SERVICE_ACCOUNT env var:", err.message);
  }
}

// 2. Fallback to local serviceAccountKey.json file (for local development)
if (!serviceAccount) {
  try {
    serviceAccount = require('../serviceAccountKey.json');
  } catch (err) {
    console.warn("Local serviceAccountKey.json not found:", err.message);
  }
}

if (!admin.apps.length && serviceAccount) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

module.exports = admin;
    