// DataContext.js

const { useState, useEffect, useContext, createContext } = React;

const DataContext = createContext();

const DataProvider = ({ children }) => {
    // --- STATE MANAGEMENT ---
    const [novels, setNovels] = useState([]);
    const [bookmarks, setBookmarks] = useState([]);
    const [readingHistory, setReadingHistory] = useState([]);
    const [readProgress, setReadProgress] = useState({});
    const [novelsLoading, setNovelsLoading] = useState(true);

    // --- CONTEXTS ---
    // AuthContext is globally available because its script tag is loaded before this one in index.html
    const { user, loading: authLoading } = useContext(AuthContext);

    // --- EFFECTS ---

    // EFFECT 1: FETCH PUBLIC NOVEL DATA
    useEffect(() => {
        // Wait for authentication to be ready before fetching data
        if (authLoading) {
            return;
        }

        // 'db' is globally available from firebase.js
        const unsubscribe = db.collection('novels')
            .where('published', '==', true)
            .orderBy('createdAt', 'desc')
            .onSnapshot(snapshot => {
                const novelsData = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                
                if (novelsData.length > 0) {
                    setNovels(novelsData);
                } else {
                    console.warn("Firestore 'novels' collection is empty. Falling back to DEMO_NOVELS.");
                    // 'DEMO_NOVELS' is globally available from demoNovels.js
                    setNovels(DEMO_NOVELS.map((n, i) => ({...n, id: `demo-${i}`})));
                }
                setNovelsLoading(false);
            }, error => {
                console.error("Error fetching novels (check Firestore rules & connection):", error);
                setNovels(DEMO_NOVELS.map((n, i) => ({...n, id: `demo-${i}`}))); // Fallback on error
                setNovelsLoading(false);
            });
        
        // Cleanup listener on unmount
        return () => unsubscribe();
    }, [authLoading]); // This dependency is key to fixing the race condition

    // EFFECT 2: LOAD USER-SPECIFIC DATA (bookmarks, history, etc.)
    useEffect(() => {
        if (authLoading) return;

        if (user) {
            // User is LOGGED IN: Listen to their data from Firestore
            const userDocRef = db.collection('users').doc(user.uid);
            
            const unsubscribe = userDocRef.onSnapshot(docSnapshot => {
                if (docSnapshot.exists) {
                    const data = docSnapshot.data();
                    setBookmarks(data.bookmarks || []);
                    setReadingHistory(data.readingHistory || []);
                    setReadProgress(data.readProgress || {});
                } else {
                    // This is a new user, create a document for them
                    console.log(`Creating document for new user: ${user.uid}`);
                    userDocRef.set({
                        email: user.email,
                        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                        bookmarks: [],
                        readingHistory: [],
                        readProgress: {}
                    }).catch(err => console.error("Failed to create user document:", err));
                }
            });
            return () => unsubscribe(); // Cleanup listener
        } else {
            // User is LOGGED OUT: Load data from Local Storage
            const savedBookmarks = localStorage.getItem('bookmarks');
            const savedHistory = localStorage.getItem('readingHistory');
            const savedProgress = localStorage.getItem('readProgress');
            
            setBookmarks(savedBookmarks ? JSON.parse(savedBookmarks) : []);
            setReadingHistory(savedHistory ? JSON.parse(savedHistory) : []);
            setReadProgress(savedProgress ? JSON.parse(savedProgress) : {});
        }
    }, [user, authLoading]);

    // EFFECT 3: SAVE USER-SPECIFIC DATA (Debounced)
    useEffect(() => {
        // Don't save anything during the initial load
        if (authLoading || novelsLoading) return;
        
        const timer = setTimeout(() => {
            if (user) {
                const userDocRef = db.collection('users').doc(user.uid);
                userDocRef.update({
                    bookmarks,
                    readingHistory,
                    readProgress,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                }).catch(error => {
                    if (error.code !== 'not-found') {
                       console.error("Error saving user data:", error);
                    }
                });
            } else {
                localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
                localStorage.setItem('readingHistory', JSON.stringify(readingHistory));
                localStorage.setItem('readProgress', JSON.stringify(readProgress));
            }
        }, 1500);

        return () => clearTimeout(timer);
    }, [bookmarks, readingHistory, readProgress, user, authLoading, novelsLoading]);

    // --- FUNCTIONS ---

    const toggleBookmark = async (novelId) => {
        const newBookmarks = bookmarks.includes(novelId) 
            ? bookmarks.filter(id => id !== novelId) 
            : [...bookmarks, novelId];
        setBookmarks(newBookmarks);
        
        if (!novelId.startsWith('demo-')) {
            try {
                const novelRef = db.collection('novels').doc(novelId);
                const incrementValue = newBookmarks.includes(novelId) ? 1 : -1;
                await novelRef.update({
                    bookmarkCount: firebase.firestore.FieldValue.increment(incrementValue)
                });
            } catch (error) {
                console.error('Error updating bookmark count:', error);
            }
        }
    };

    const addToHistory = (novelId, chapterId) => {
        const novel = novels.find(n => n.id === novelId);
        const chapter = novel?.chapters?.find(c => c.id === chapterId);
        
        if (novel && chapter) {
            setReadingHistory(prev => {
                const filtered = prev.filter(h => h.novelId !== novelId);
                return [{
                    novelId, chapterId,
                    novelTitle: novel.title,
                    chapterTitle: chapter.title,
                    timestamp: Date.now()
                }, ...filtered].slice(0, 50);
            });
        }
    };
    
    const updateReadProgress = (novelId, chapterId, progress) => {
        setReadProgress(prev => ({
            ...prev,
            [`${novelId}:${chapterId}`]: progress
        }));
    };
    
    const incrementViewCount = async (novelId) => {
        if (novelId.startsWith('demo-')) return;
        try {
            const novelRef = db.collection('novels').doc(novelId);
            await novelRef.update({
                views: firebase.firestore.FieldValue.increment(1)
            });
        } catch (error) {
            console.error("Error incrementing view count:", error);
        }
    };
    
    const contextValue = {
        novels,
        bookmarks,
        readingHistory,
        readProgress,
        loading: authLoading || novelsLoading, // Overall loading state
        toggleBookmark,
        addToHistory,
        updateReadProgress,
        incrementViewCount
    };

    return (
        <DataContext.Provider value={contextValue}>
            {children}
        </DataContext.Provider>
    );
};
