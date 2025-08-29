// Simple Firebase Configuration with Connection Management
const getFirebaseConfig = () => {
    const isDevelopment = window.location.hostname === 'localhost' || 
                         window.location.hostname === '127.0.0.1';
    
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

// Connection state
let connectionState = {
    isOnline: true,
    isConnected: false,
    retryCount: 0
};

// Initialize Firebase with better error handling
try {
    const firebaseConfig = getFirebaseConfig();
    
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    
    const auth = firebase.auth();
    const db = firebase.firestore();
    const storage = firebase.storage();
    
    // IMPORTANT: Configure Firestore for better performance
    db.settings({
        cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED,
        experimentalForceLongPolling: false
    });
    
    // Enable offline persistence
    db.enablePersistence({ synchronizeTabs: true })
        .then(() => {
            console.log('📱 Offline persistence enabled');
            connectionState.isConnected = true;
        })
        .catch((err) => {
            console.warn('⚠️ Persistence warning:', err.code);
            // Continue anyway
            connectionState.isConnected = true;
        });
    
    // Monitor connection
    const connectedRef = firebase.database().ref('.info/connected');
    connectedRef.on('value', (snapshot) => {
        connectionState.isOnline = snapshot.val() === true;
        console.log(connectionState.isOnline ? '🟢 Firebase connected' : '🔴 Firebase disconnected');
    });
    
    // Admin emails
    const ADMIN_EMAILS = ['vikassingh44999@gmail.com'];
    
    console.log('🔥 Firebase initialized successfully');
    console.log('📧 Admin emails configured');
    
} catch (error) {
    console.error('❌ Firebase initialization error:', error);
}

// Helper function to check connection
window.isFirebaseConnected = () => connectionState.isOnline && connectionState.isConnected;
