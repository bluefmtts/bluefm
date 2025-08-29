const { useState, useEffect, useContext, createContext, useMemo } = React;

const DataContext = createContext();

const DataProvider = ({ children }) => {
    const [novels, setNovels] = useState([]);
    const [bookmarks, setBookmarks] = useState([]);
    const [readingHistory, setReadingHistory] = useState([]);
    const [readProgress, setReadProgress] = useState({});
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [demoDataLoaded, setDemoDataLoaded] = useState(false);
    const { user } = useContext(AuthContext);
    
    // Pagination states
    const [lastVisible, setLastVisible] = useState(null);
    const [hasMore, setHasMore] = useState(true);
    const [cachedNovels, setCachedNovels] = useState(new Map());
    const [cachedChapters, setCachedChapters] = useState(new Map());
    
    const NOVELS_PER_PAGE = 6; // Load only 6 novels at a time
    
    // Load demo data if database is empty
    const loadDemoData = async () => {
        if (demoDataLoaded) return;
        
        try {
            const snapshot = await db.collection('novels').limit(1).get();
            
            if (snapshot.empty) {
                console.log('Loading demo novels...');
                // Add only first few demo novels, not all
                for (const novel of DEMO_NOVELS.slice(0, 3)) {
                    // Remove chapters from initial load
                    const { chapters, ...novelData } = novel;
                    await db.collection('novels').add({
                        ...novelData,
                        totalChapters: chapters ? chapters.length : 0,
                        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                    });
                    
                    // Store chapters separately (not loaded initially)
                    if (chapters && chapters.length > 0) {
                        const novelDoc = await db.collection('novels').add(novelData);
                        for (const chapter of chapters) {
                            await db.collection('novels')
                                .doc(novelDoc.id)
                                .collection('chapters')
                                .add(chapter);
                        }
                    }
                }
                console.log('Demo novels loaded successfully!');
            }
            setDemoDataLoaded(true);
        } catch (error) {
            console.error('Error loading demo data:', error);
            // If Firebase fails, use minimal local demo data
            setNovels(DEMO_NOVELS.slice(0, 3).map((novel, index) => ({
                ...novel,
                id: `demo-${index}`,
                chapters: undefined // Don't include chapters initially
            })));
            setLoading(false);
        }
    };
    
    // Initial load - fetch only first batch of novels WITHOUT chapters
    const loadInitialNovels = async () => {
        try {
            setLoading(true);
            await loadDemoData();
            
            const query = db.collection('novels')
                .where('published', '==', true)
                .orderBy('createdAt', 'desc')
                .limit(NOVELS_PER_PAGE);
                
            const snapshot = await query.get();
            
            if (!snapshot.empty) {
                const novelsData = [];
                snapshot.forEach(doc => {
                    const data = doc.data();
                    // Only get basic info, NO chapters
                    novelsData.push({
                        id: doc.id,
                        title: data.title,
                        author: data.author,
                        coverImage: data.coverImage,
                        genre: data.genre,
                        description: data.description ? 
                            (data.description.substring(0, 200) + '...') : '',
                        rating: data.rating || 0,
                        views: data.views || 0,
                        bookmarkCount: data.bookmarkCount || 0,
                        totalChapters: data.totalChapters || 0,
                        isPremium: data.isPremium || false,
                        published: data.published
                    });
                });
                
                setNovels(novelsData);
                setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
                setHasMore(snapshot.docs.length === NOVELS_PER_PAGE);
            }
        } catch (error) {
            console.error('Error fetching novels:', error);
            // Fallback to minimal demo data
            setNovels(DEMO_NOVELS.slice(0, 3).map((novel, index) => ({
                ...novel,
                id: `demo-${index}`,
                chapters: undefined
            })));
        } finally {
            setLoading(false);
        }
    };
    
    // Load more novels when scrolling (pagination)
    const loadMoreNovels = async () => {
        if (!hasMore || loadingMore || !lastVisible) return;
        
        try {
            setLoadingMore(true);
            
            const query = db.collection('novels')
                .where('published', '==', true)
                .orderBy('createdAt', 'desc')
                .startAfter(lastVisible)
                .limit(NOVELS_PER_PAGE);
                
            const snapshot = await query.get();
            
            if (!snapshot.empty) {
                const novelsData = [];
                snapshot.forEach(doc => {
                    const data = doc.data();
                    novelsData.push({
                        id: doc.id,
                        title: data.title,
                        author: data.author,
                        coverImage: data.coverImage,
                        genre: data.genre,
                        description: data.description ? 
                            (data.description.substring(0, 200) + '...') : '',
                        rating: data.rating || 0,
                        views: data.views || 0,
                        bookmarkCount: data.bookmarkCount || 0,
                        totalChapters: data.totalChapters || 0,
                        isPremium: data.isPremium || false,
                        published: data.published
                    });
                });
                
                setNovels(prev => [...prev, ...novelsData]);
                setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
                setHasMore(snapshot.docs.length === NOVELS_PER_PAGE);
            } else {
                setHasMore(false);
            }
        } catch (error) {
            console.error('Error loading more novels:', error);
        } finally {
            setLoadingMore(false);
        }
    };
    
    // Get single novel with full details (load on demand)
    const getNovelDetails = async (novelId) => {
        // Check cache first
        if (cachedNovels.has(novelId)) {
            return cachedNovels.get(novelId);
        }
        
        try {
            const doc = await db.collection('novels').doc(novelId).get();
            if (doc.exists) {
                const novelData = {
                    id: doc.id,
                    ...doc.data()
                };
                // Cache it
                setCachedNovels(prev => new Map(prev).set(novelId, novelData));
                return novelData;
            }
        } catch (error) {
            console.error('Error getting novel details:', error);
        }
        return null;
    };
    
    // Get chapters list WITHOUT content (for chapter selection)
    const getChaptersList = async (novelId) => {
        try {
            const snapshot = await db.collection('novels')
                .doc(novelId)
                .collection('chapters')
                .orderBy('chapterNumber', 'asc')
                .get();
                
            const chapters = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                chapters.push({
                    id: doc.id,
                    chapterNumber: data.chapterNumber,
                    title: data.title,
                    isPremium: data.isPremium || false,
                    isLocked: data.isLocked || false
                    // NO content here
                });
            });
            
            return chapters;
        } catch (error) {
            console.error('Error getting chapters list:', error);
            // Try from demo data if it's a demo novel
            if (novelId.startsWith('demo-')) {
                const demoNovel = DEMO_NOVELS.find(n => n.id === novelId);
                if (demoNovel && demoNovel.chapters) {
                    return demoNovel.chapters.map(ch => ({
                        id: ch.id,
                        chapterNumber: ch.chapterNumber,
                        title: ch.title,
                        isPremium: ch.isPremium || false
                    }));
                }
            }
            return [];
        }
    };
    
    // Get single chapter content (load only when reading)
    const getChapterContent = async (novelId, chapterId) => {
        const cacheKey = `${novelId}_${chapterId}`;
        
        // Check cache first
        if (cachedChapters.has(cacheKey)) {
            return cachedChapters.get(cacheKey);
        }
        
        try {
            const doc = await db.collection('novels')
                .doc(novelId)
                .collection('chapters')
                .doc(chapterId)
                .get();
                
            if (doc.exists) {
                const chapterData = {
                    id: doc.id,
                    ...doc.data()
                };
                // Cache it (limit cache size)
                if (cachedChapters.size > 20) {
                    // Remove oldest entries
                    const firstKey = cachedChapters.keys().next().value;
                    cachedChapters.delete(firstKey);
                }
                setCachedChapters(prev => new Map(prev).set(cacheKey, chapterData));
                return chapterData;
            }
        } catch (error) {
            console.error('Error getting chapter content:', error);
            // Try demo data
            if (novelId.startsWith('demo-')) {
                const demoNovel = DEMO_NOVELS.find(n => n.id === novelId);
                const chapter = demoNovel?.chapters?.find(ch => ch.id === chapterId);
                if (chapter) return chapter;
            }
        }
        return null;
    };
    
    // Search novels (limited results)
    const searchNovels = async (searchTerm) => {
        if (!searchTerm || searchTerm.length < 2) return [];
        
        try {
            const query = db.collection('novels')
                .where('published', '==', true)
                .orderBy('title')
                .startAt(searchTerm)
                .endAt(searchTerm + '\uf8ff')
                .limit(10); // Limit search results
                
            const snapshot = await query.get();
            const results = [];
            
            snapshot.forEach(doc => {
                const data = doc.data();
                results.push({
                    id: doc.id,
                    title: data.title,
                    author: data.author,
                    coverImage: data.coverImage,
                    genre: data.genre
                });
            });
            
            return results;
        } catch (error) {
            console.error('Error searching novels:', error);
            return [];
        }
    };
    
    // Initial load
    useEffect(() => {
        loadInitialNovels();
    }, []);
    
    // Load user data (unchanged)
    useEffect(() => {
        if (user) {
            loadUserData();
        } else {
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
    
    const addToHistory = (novelId, chapterId, chapterTitle) => {
        setReadingHistory(prev => {
            const filtered = prev.filter(h => !(h.novelId === novelId && h.chapterId === chapterId));
            return [{
                novelId,
                chapterId,
                chapterTitle,
                timestamp: Date.now()
            }, ...filtered].slice(0, 50);
        });
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
            loadingMore,
            hasMore,
            toggleBookmark,
            addToHistory,
            updateReadProgress,
            incrementViewCount,
            loadMoreNovels,
            getNovelDetails,
            getChaptersList,
            getChapterContent,
            searchNovels
        }}>
            {children}
        </DataContext.Provider>
    );
};
