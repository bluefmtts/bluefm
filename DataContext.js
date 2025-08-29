const { useState, useEffect, useContext, createContext, useMemo } = React;

const DataContext = createContext();

const DataProvider = ({ children }) => {
    const [novels, setNovels] = useState([]);
    const [bookmarks, setBookmarks] = useState([]);
    const [readingHistory, setReadingHistory] = useState([]);
    const [readProgress, setReadProgress] = useState({});
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [lastVisible, setLastVisible] = useState(null);
    const [hasMore, setHasMore] = useState(true);
    const [connectionError, setConnectionError] = useState(false);
    const [retryCount, setRetryCount] = useState(0);
    const { user } = useContext(AuthContext);
    
    const NOVELS_PER_PAGE = 6;
    const MAX_RETRIES = 3;
    
    // Load novels with retry logic
    const loadInitialNovels = async (retry = 0) => {
        try {
            setLoading(true);
            setConnectionError(false);
            console.log(`Loading novels... (Attempt ${retry + 1})`);
            
            const query = db.collection('novels')
                .where('published', '==', true)
                .orderBy('createdAt', 'desc')
                .limit(NOVELS_PER_PAGE);
            
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Query timeout')), 8000)
            );
            
            const queryPromise = query.get();
            const snapshot = await Promise.race([queryPromise, timeoutPromise]);
            
            if (snapshot && !snapshot.empty) {
                const novelsData = [];
                
                snapshot.forEach(doc => {
                    const data = doc.data();
                    novelsData.push({
                        id: doc.id,
                        title: data.title || 'Untitled',
                        author: data.author || 'Unknown',
                        coverImage: data.coverImage || data.coverUrl || null,
                        genre: data.genre || 'General',
                        status: data.status || 'Ongoing',
                        rating: data.rating || 0,
                        views: data.views || 0,
                        totalChapters: data.totalChapters || 0,
                        summary: (data.summary || data.description || '').substring(0, 200),
                        featured: data.featured || false
                    });
                });
                
                setNovels(novelsData);
                setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
                setHasMore(snapshot.docs.length === NOVELS_PER_PAGE);
                setRetryCount(0);
                console.log(`✅ Loaded ${novelsData.length} novels`);
            } else {
                console.log('📭 No novels found');
                setNovels([]);
                setHasMore(false);
            }
            
        } catch (error) {
            console.error('❌ Error loading novels:', error);
            
            if (retry < MAX_RETRIES) {
                console.log(`🔄 Retrying in ${(retry + 1) * 2} seconds...`);
                setTimeout(() => {
                    loadInitialNovels(retry + 1);
                }, (retry + 1) * 2000);
                return;
            }
            
            setConnectionError(true);
            setNovels([]);
        } finally {
            if (retry >= MAX_RETRIES || !connectionError) {
                setLoading(false);
            }
        }
    };
    
    // Get chapters list - FIXED VERSION
    const getChaptersList = async (novelId) => {
        try {
            console.log(`Loading chapters for: ${novelId}`);
            let chapters = [];
            
            // Method 1: Try subcollection first
            try {
                const snapshot = await db.collection('novels')
                    .doc(novelId)
                    .collection('chapters')
                    .orderBy('chapterNumber', 'asc')
                    .limit(50)
                    .get();
                
                if (!snapshot.empty) {
                    snapshot.forEach(doc => {
                        const data = doc.data();
                        chapters.push({
                            id: doc.id,
                            number: data.chapterNumber || data.number || 1,
                            chapterNumber: data.chapterNumber || data.number || 1,
                            title: data.title || `Chapter ${data.chapterNumber || 1}`,
                            isPremium: data.isPremium || false
                        });
                    });
                    console.log(`✅ Found ${chapters.length} chapters in subcollection`);
                }
            } catch (subError) {
                console.log('Subcollection error, trying array field...');
            }
            
            // Method 2: If no subcollection, try chapters array in novel document
            if (chapters.length === 0) {
                const novelDoc = await db.collection('novels').doc(novelId).get();
                if (novelDoc.exists) {
                    const data = novelDoc.data();
                    
                    // Check if chapters exist as array
                    if (data.chapters && Array.isArray(data.chapters) && data.chapters.length > 0) {
                        chapters = data.chapters.map((ch, index) => ({
                            id: ch.id || `ch${index + 1}`,
                            number: ch.chapterNumber || ch.number || index + 1,
                            chapterNumber: ch.chapterNumber || ch.number || index + 1,
                            title: ch.title || `Chapter ${index + 1}`,
                            isPremium: ch.isPremium || false
                        }));
                        console.log(`✅ Found ${chapters.length} chapters in array field`);
                    }
                    
                    // Method 3: Check for individual chapter fields (chapter1, chapter2, etc.)
                    if (chapters.length === 0) {
                        const chapterKeys = Object.keys(data).filter(key => key.startsWith('chapter'));
                        if (chapterKeys.length > 0) {
                            chapters = chapterKeys.map((key, index) => ({
                                id: `ch${index + 1}`,
                                number: index + 1,
                                chapterNumber: index + 1,
                                title: data[key].title || `Chapter ${index + 1}`,
                                isPremium: data[key].isPremium || false
                            }));
                            console.log(`✅ Found ${chapters.length} chapters as individual fields`);
                        }
                    }
                }
            }
            
            console.log(`✅ Total chapters loaded: ${chapters.length}`);
            return chapters;
            
        } catch (error) {
            console.error('Error loading chapters:', error);
            return [];
        }
    };
    
    // Get single chapter content
    const getChapterContent = async (novelId, chapterId) => {
        try {
            console.log(`Loading chapter content: ${chapterId}`);
            
            // Try subcollection
            try {
                const doc = await db.collection('novels')
                    .doc(novelId)
                    .collection('chapters')
                    .doc(chapterId)
                    .get();
                
                if (doc.exists) {
                    return { id: doc.id, ...doc.data() };
                }
            } catch (subError) {
                console.log('Subcollection failed, trying array...');
            }
            
            // Try array field
            const novelDoc = await db.collection('novels').doc(novelId).get();
            if (novelDoc.exists) {
                const data = novelDoc.data();
                
                // Check in chapters array
                if (data.chapters && Array.isArray(data.chapters)) {
                    const chapter = data.chapters.find(ch => ch.id === chapterId);
                    if (chapter) return chapter;
                }
                
                // Check as individual field
                if (data[chapterId]) {
                    return { id: chapterId, ...data[chapterId] };
                }
            }
            
            return null;
        } catch (error) {
            console.error('Error loading chapter:', error);
            return null;
        }
    };
    
    // Rest of your functions remain the same...
    const loadMoreNovels = async () => {
        if (!hasMore || loadingMore || !lastVisible || connectionError) return;
        
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
                        title: data.title || 'Untitled',
                        author: data.author || 'Unknown',
                        coverImage: data.coverImage || data.coverUrl || null,
                        genre: data.genre || 'General',
                        status: data.status || 'Ongoing',
                        rating: data.rating || 0,
                        views: data.views || 0,
                        totalChapters: data.totalChapters || 0,
                        summary: (data.summary || data.description || '').substring(0, 200),
                        featured: data.featured || false
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
    
    const getNovelDetails = async (novelId) => {
        try {
            const novel = novels.find(n => n.id === novelId);
            if (novel) return novel;
            
            const doc = await db.collection('novels').doc(novelId).get();
            if (doc.exists) {
                return { id: doc.id, ...doc.data() };
            }
            return null;
        } catch (error) {
            console.error('Error getting novel:', error);
            return null;
        }
    };
    
    const searchNovels = (searchTerm) => {
        if (!searchTerm || searchTerm.length < 2) return [];
        
        const term = searchTerm.toLowerCase();
        return novels.filter(novel => 
            novel.title.toLowerCase().includes(term) ||
            novel.author.toLowerCase().includes(term)
        ).slice(0, 10);
    };
    
    const retryConnection = () => {
        setRetryCount(0);
        loadInitialNovels(0);
    };
    
    // User data functions
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
        localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
        localStorage.setItem('readingHistory', JSON.stringify(readingHistory));
        localStorage.setItem('readProgress', JSON.stringify(readProgress));
        
        if (!user) return;
        
        try {
            await db.collection('users').doc(user.uid).update({
                bookmarks,
                readingHistory,
                readProgress,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        } catch (error) {
            // Silent fail
        }
    };
    
    useEffect(() => {
        const timer = setTimeout(saveUserData, 1000);
        return () => clearTimeout(timer);
    }, [bookmarks, readingHistory, readProgress]);
    
    const toggleBookmark = (novelId) => {
        setBookmarks(prev => {
            if (prev.includes(novelId)) {
                return prev.filter(id => id !== novelId);
            } else {
                return [...prev, novelId];
            }
        });
    };
    
    const addToHistory = (novelId, chapterId, chapterTitle = '') => {
        const novel = novels.find(n => n.id === novelId);
        if (novel) {
            setReadingHistory(prev => {
                const filtered = prev.filter(h => !(h.novelId === novelId && h.chapterId === chapterId));
                return [{
                    novelId,
                    chapterId,
                    novelTitle: novel.title,
                    chapterTitle: chapterTitle || `Chapter ${chapterId}`,
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
        try {
            await db.collection('novels').doc(novelId).update({
                views: firebase.firestore.FieldValue.increment(1)
            });
        } catch (error) {
            // Silent fail
        }
    };
    
    // Initial load
    useEffect(() => {
        setTimeout(() => {
            loadInitialNovels(0);
        }, 1000);
    }, []);
    
    return (
        <DataContext.Provider value={{
            novels,
            bookmarks,
            readingHistory,
            readProgress,
            loading,
            loadingMore,
            hasMore,
            connectionError,
            toggleBookmark,
            addToHistory,
            updateReadProgress,
            incrementViewCount,
            loadMoreNovels,
            getNovelDetails,
            getChaptersList,
            getChapterContent,
            searchNovels,
            retryConnection
        }}>
            {children}
        </DataContext.Provider>
    );
};

window.DataProvider = DataProvider;
window.useData = () => useContext(DataContext);
