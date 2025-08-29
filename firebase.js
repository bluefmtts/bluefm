
// Simple Firebase Configuration (Browser Compatible)
const getFirebaseConfig = () => {
    // Check if we're in development
    const isDevelopment = window.location.hostname === 'localhost' || 
                         window.location.hostname === '127.0.0.1';
    
    // For now, use direct config (we'll secure it during deployment)
    return {
           apiKey: "AIzaSyC6yENwSy7BixcQS7rf0eWKmTA5Vhh5Xbo",
  authDomain: "tts-bot-db.firebaseapp.com",
  databaseURL: "https://tts-bot-db-default-rtdb.firebaseio.com",
  projectId: "tts-bot-db",
  storageBucket: "tts-bot-db.firebasestorage.app",
  messagingSenderId: "47722242167",
  appId: "1:47722242167:web:75550df71113d97db2e672",
  measurementId: "G-VGH8LNSS6M"
    };
};

// Initialize Firebase
const firebaseConfig = getFirebaseConfig();

// Check if Firebase is already initialized
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// Admin emails (we'll secure this during deployment)
const ADMIN_EMAILS = ['vikassingh44999@gmail.com'];

// Log status
console.log('🔥 Firebase initialized successfully');
console.log('📧 Admin emails configured');

