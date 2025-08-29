const { useState, useEffect, useContext, createContext, useMemo } = React;

const DataContext = createContext();

const DataProvider = ({ children }) => {
    const [novels, setNovels] = useState([]);
    const [bookmarks, setBookmarks] = useState([]);
    const [readingHistory, setReadingHistory] = useState([]);
    const [readProgress, setReadProgress] = useState({});
    const [loading, setLoading] = useState(true);
    const [demoDataLoaded, setDemoDataLoaded] = useState(false);
    const { user } = useContext(AuthContext);
    
    // Load demo data if database is empty
    const loadDemoData = async () => {
        if (demoDataLoaded) return;
        
        try {
            const snapshot = await db.collection('novels').limit(1).get();
            
            if (snapshot.empty) {
                console.log('Loading demo novels...');
                // Add demo novels to Firebase
                for (const novel of DEMO_NOVELS) {
                    await db.collection('novels').add({
                        ...novel,
                        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                    });
                }
                console.log('Demo novels loaded successfully!');
            }
            setDemoDataLoaded(true);
        } catch (error) {
            console.error('Error loading demo data:', error);
            // If Firebase fails, use local demo data
            setNovels(DEMO_NOVELS.map((novel, index) => ({
                ...novel,
                id: `demo-${index}`
            })));
            setLoading(false);
        }
    };
    
    // Fetch novels from Firebase
    useEffect(() => {
        loadDemoData();
        
        const unsubscribe = db.collection('novels')
            .where('published', '==', true)
            .orderBy('createdAt', 'desc')
            .onSnapshot(snapshot => {
                const novelsData = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setNovels(novelsData);
                setLoading(false);
            }, error => {
                console.error('Error fetching novels:', error);
                // Fallback to demo data
                setNovels(DEMO_NOVELS.map((novel, index) => ({
                    ...novel,
                    id: `demo-${index}`
                })));
                setLoading(false);
            });
        
        return unsubscribe;
    }, []);
    
    // Load user data
    useEffect(() => {
        if (user) {
            loadUserData();
        } else {
            // Load from localStorage for non-logged in users
            const savedBookmarks = localStorage.getItem('bookmarks');
            const savedHistory = localStorage.getItem('readingHistory');
            const savedProgress = localStorage.getItem('readProgress');
            
            if (savedBookmarks) setBookmarks(JSON.parse(savedBookmarks));
            if (savedHistory) setReadingHistory(JSON.parse(savedHistory));
            if (savedProgress) setReadProgress(JSON.parse(savedProgress));
        }
    }, [user]);
    
    const loadUserData = async () => {
        if (!user) return;
        try {
            const userDoc = await db.collection('users').doc(user.uid).get();
            if (userDoc.exists) {
                const data = userDoc.data();
                if (data.bookmarks) setBookmarks(data.bookmarks);
                if (data.readingHistory) setReadingHistory(data.readingHistory);
                if (data.readProgress) setReadProgress(data.readProgress);
            }
        } catch (error) {
            console.error("Error loading user data:", error);
        }
    };
    
    const saveUserData = async () => {
        if (!user) {
            // Save to localStorage for non-logged in users
            localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
            localStorage.setItem('readingHistory', JSON.stringify(readingHistory));
            localStorage.setItem('readProgress', JSON.stringify(readProgress));
            return;
        }
        
        try {
            await db.collection('users').doc(user.uid).update({
                bookmarks,
                readingHistory,
                readProgress,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        } catch (error) {
            console.error("Error saving user data:", error);
        }
    };
    
    // Save user data when it changes
    useEffect(() => {
        const timer = setTimeout(saveUserData, 1000);
        return () => clearTimeout(timer);
    }, [bookmarks, readingHistory, readProgress]);
    
    const toggleBookmark = async (novelId) => {
        setBookmarks(prev => {
            if (prev.includes(novelId)) {
                return prev.filter(id => id !== novelId);
            } else {
                return [...prev, novelId];
            }
        });
        
        // Update novel bookmark count if not demo data
        if (!novelId.startsWith('demo-')) {
            try {
                const novelRef = db.collection('novels').doc(novelId);
                const increment = bookmarks.includes(novelId) ? -1 : 1;
                await novelRef.update({
                    bookmarkCount: firebase.firestore.FieldValue.increment(increment)
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
                const filtered = prev.filter(h => !(h.novelId === novelId && h.chapterId === chapterId));
                return [{
                    novelId,
                    chapterId,
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
            await db.collection('novels').doc(novelId).update({
                views: firebase.firestore.FieldValue.increment(1)
            });
        } catch (error) {
            console.error("Error incrementing view count:", error);
        }
    };
    
    return (
        <DataContext.Provider value={{
            novels,
            bookmarks,
            readingHistory,
            readProgress,
            loading,
            toggleBookmark,
            addToHistory,
            updateReadProgress,
            incrementViewCount
        }}>
            {children}
        </DataContext.Provider>
    );
};
