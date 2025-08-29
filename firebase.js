// Optimized Firebase Configuration with Performance Settings
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

// Connection state management
let connectionState = {
    isOnline: navigator.onLine,
    isConnected: false,
    retryCount: 0,
    maxRetries: 3
};

// Initialize Firebase with optimizations
const initializeFirebase = () => {
    try {
        const firebaseConfig = getFirebaseConfig();
        
        // Check if Firebase is already initialized
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }
        
        // Configure Firestore for better performance
        const firestoreSettings = {
            cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED,
            experimentalForceLongPolling: false, // Use WebSocket for better performance
        };
        
        // Initialize services
        const auth = firebase.auth();
        const db = firebase.firestore();
        const storage = firebase.storage();
        
        // Apply Firestore settings
        db.settings(firestoreSettings);
        
        // Enable offline persistence with better error handling
        db.enablePersistence({ synchronizeTabs: true })
            .then(() => {
                console.log('📱 Offline persistence enabled');
            })
            .catch((err) => {
                if (err.code === 'failed-precondition') {
                    console.warn('⚠️ Multiple tabs open, persistence failed');
                } else if (err.code === 'unimplemented') {
                    console.warn('⚠️ Browser doesn\'t support persistence');
                } else {
                    console.warn('⚠️ Persistence error:', err);
                }
            });
        
        // Set up connection monitoring
        setupConnectionMonitoring(db);
        
        console.log('🔥 Firebase initialized successfully');
        console.log('📧 Admin emails configured');
        
        return { auth, db, storage };
        
    } catch (error) {
        console.error('❌ Firebase initialization failed:', error);
        throw error;
    }
};

// Connection monitoring and retry logic
const setupConnectionMonitoring = (db) => {
    // Monitor online/offline status
    window.addEventListener('online', () => {
        connectionState.isOnline = true;
        console.log('🌐 Back online');
    });
    
    window.addEventListener('offline', () => {
        connectionState.isOnline = false;
        console.log('📡 Gone offline');
    });
    
    // Monitor Firestore connection
    db.enableNetwork().then(() => {
        connectionState.isConnected = true;
    }).catch((error) => {
        console.warn('🔥 Firestore connection issue:', error);
        connectionState.isConnected = false;
    });
};

// Optimized query helpers
const QueryHelpers = {
    // Paginated query with caching
    createPaginatedQuery: (collection, orderField = 'createdAt', limit = 10, lastDoc = null) => {
        let query = db.collection(collection)
            .orderBy(orderField, 'desc')
            .limit(limit);
            
        if (lastDoc) {
            query = query.startAfter(lastDoc);
        }
        
        return query;
    },
    
    // Optimized single document get
    getDocumentOptimized: async (collection, docId, useCache = true) => {
        try {
            const source = useCache ? 'default' : 'server';
            const doc = await db.collection(collection).doc(docId).get({ source });
            return doc.exists ? { id: doc.id, ...doc.data() } : null;
        } catch (error) {
            console.error(`Error getting document ${docId}:`, error);
            // Fallback to cache if server fails
            if (!useCache) {
                try {
                    const doc = await db.collection(collection).doc(docId).get({ source: 'cache' });
                    return doc.exists ? { id: doc.id, ...doc.data() } : null;
                } catch (cacheError) {
                    console.error('Cache fallback failed:', cacheError);
                }
            }
            throw error;
        }
    },
    
    // Batch operations
    createBatch: () => db.batch(),
    
    // Real-time listener with error handling
    createListener: (query, onSuccess, onError = console.error) => {
        return query.onSnapshot(
            (snapshot) => {
                try {
                    onSuccess(snapshot);
                    connectionState.retryCount = 0; // Reset retry count on success
                } catch (error) {
                    onError(error);
                }
            },
            (error) => {
                console.error('Firestore listener error:', error);
                
                // Implement retry logic
                if (connectionState.retryCount < connectionState.maxRetries) {
                    connectionState.retryCount++;
                    console.log(`🔄 Retrying connection (${connectionState.retryCount}/${connectionState.maxRetries})`);
                    
                    setTimeout(() => {
                        QueryHelpers.createListener(query, onSuccess, onError);
                    }, Math.pow(2, connectionState.retryCount) * 1000); // Exponential backoff
                } else {
                    onError(error);
                }
            }
        );
    }
};

// Initialize Firebase
const { auth, db, storage } = initializeFirebase();

// Admin configuration
const ADMIN_EMAILS = ['vikassingh44999@gmail.com'];

// Utility functions for your app
const FirebaseUtils = {
    // Check if user is admin
    isAdmin: (user) => {
        return user && ADMIN_EMAILS.includes(user.email);
    },
    
    // Optimized queries for novels
    novels: {
        // Get novels with pagination
        getPaginated: async (lastDoc = null, limit = 6) => {
            try {
                const query = QueryHelpers.createPaginatedQuery('novels', 'createdAt', limit, lastDoc);
                const snapshot = await query.get();
                
                const novels = [];
                let lastVisible = null;
                
                snapshot.forEach(doc => {
                    novels.push({
                        id: doc.id,
                        title: doc.data().title,
                        author: doc.data().author,
                        coverImage: doc.data().coverImage,
                        genre: doc.data().genre,
                        rating: doc.data().rating || 0,
                        views: doc.data().views || 0,
                        totalChapters: doc.data().totalChapters || 0,
                        isPremium: doc.data().isPremium || false,
                        status: doc.data().status || 'Ongoing',
                        published: doc.data().published || false
                    });
                });
                
                if (snapshot.docs.length > 0) {
                    lastVisible = snapshot.docs[snapshot.docs.length - 1];
                }
                
                return { novels, lastVisible, hasMore: snapshot.docs.length === limit };
            } catch (error) {
                console.error('Error getting paginated novels:', error);
                throw error;
            }
        },
        
        // Get single novel
        getById: (id) => QueryHelpers.getDocumentOptimized('novels', id),
        
        // Get chapters list (without content)
        getChaptersList: async (novelId) => {
            try {
                const snapshot = await db.collection('novels')
                    .doc(novelId)
                    .collection('chapters')
                    .select('chapterNumber', 'title', 'isPremium', 'isLocked') // Only get needed fields
                    .orderBy('chapterNumber')
                    .get();
                
                return snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
            } catch (error) {
                console.error('Error getting chapters list:', error);
                throw error;
            }
        },
        
        // Get single chapter content
        getChapterContent: (novelId, chapterId) => {
            return QueryHelpers.getDocumentOptimized(`novels/${novelId}/chapters`, chapterId);
        },
        
        // Search novels (optimized)
        search: async (searchTerm, limit = 10) => {
            try {
                // Use compound queries for better performance
                const queries = [
                    db.collection('novels')
                        .where('published', '==', true)
                        .where('title', '>=', searchTerm)
                        .where('title', '<=', searchTerm + '\uf8ff')
                        .limit(limit),
                    
                    db.collection('novels')
                        .where('published', '==', true)
                        .where('author', '>=', searchTerm)
                        .where('author', '<=', searchTerm + '\uf8ff')
                        .limit(limit)
                ];
                
                const results = await Promise.all(queries.map(q => q.get()));
                const combinedResults = new Map();
                
                results.forEach(snapshot => {
                    snapshot.forEach(doc => {
                        if (!combinedResults.has(doc.id)) {
                            combinedResults.set(doc.id, {
                                id: doc.id,
                                title: doc.data().title,
                                author: doc.data().author,
                                coverImage: doc.data().coverImage,
                                genre: doc.data().genre
                            });
                        }
                    });
                });
                
                return Array.from(combinedResults.values()).slice(0, limit);
            } catch (error) {
                console.error('Error searching novels:', error);
                throw error;
            }
        }
    },
    
    // User operations
    users: {
        // Get or create user document
        getOrCreate: async (user) => {
            try {
                const userDoc = await QueryHelpers.getDocumentOptimized('users', user.uid);
                
                if (!userDoc) {
                    const newUserData = {
                        email: user.email,
                        displayName: user.displayName || '',
                        photoURL: user.photoURL || '',
                        bookmarks: [],
                        readingHistory: [],
                        readProgress: {},
                        isPremium: false,
                        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                        lastLogin: firebase.firestore.FieldValue.serverTimestamp()
                    };
                    
                    await db.collection('users').doc(user.uid).set(newUserData);
                    return { id: user.uid, ...newUserData };
                }
                
                // Update last login
                await db.collection('users').doc(user.uid).update({
                    lastLogin: firebase.firestore.FieldValue.serverTimestamp()
                });
                
                return userDoc;
            } catch (error) {
                console.error('Error getting/creating user:', error);
                throw error;
            }
        },
        
        // Update user data
        update: (userId, data) => {
            return db.collection('users').doc(userId).update({
                ...data,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        }
    },
    
    // Analytics helpers
    analytics: {
        // Increment view count
        incrementViews: (novelId) => {
            return db.collection('novels').doc(novelId).update({
                views: firebase.firestore.FieldValue.increment(1),
                lastViewed: firebase.firestore.FieldValue.serverTimestamp()
            });
        },
        
        // Track reading progress
        trackProgress: (userId, novelId, chapterId, progress) => {
            return db.collection('users').doc(userId).update({
                [`readProgress.${novelId}:${chapterId}`]: progress,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        }
    }
};

// Export everything
window.auth = auth;
window.db = db;
window.storage = storage;
window.FirebaseUtils = FirebaseUtils;
window.QueryHelpers = QueryHelpers;
window.connectionState = connectionState;

// Performance monitoring
if (window.performance && window.performance.mark) {
    window.performance.mark('firebase-initialized');
}

console.log('🚀 Optimized Firebase setup complete');
