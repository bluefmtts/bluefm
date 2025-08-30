const { useState, useEffect, useContext, createContext } = React;

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
    const [cachedChapters, setCachedChapters] = useState(new Map());
    const { user } = useContext(AuthContext);
    
    const NOVELS_PER_PAGE = 8;
    
    // ✅ Load ONLY novels - NO CHAPTERS CONTENT
    const loadInitialNovels = async () => {
        try {
            setLoading(true);
            console.log('Loading novels...');
            
            const query = db.collection('novels')
                .where('published', '==', true)
                .orderBy('createdAt', 'desc')
                .limit(NOVELS_PER_PAGE);
                
            const snapshot = await query.get();
            
            if (!snapshot.empty) {
                const novelsData = [];
                
                snapshot.forEach(doc => {
                    const data = doc.data();
                    // ✅ IMPORTANT: No chapters loading here!
                    novelsData.push({
                        id: doc.id,
                        title: data.title || 'Untitled',
                        author: data.author || 'Unknown',
                        coverImage: data.coverImage || data.coverUrl || null,
                        coverUrl: data.coverImage || data.coverUrl || null,
                        genre: data.genre || 'General',
                        status: data.status || 'Ongoing',
                        rating: data.rating || 0,
                        views: data.views || 0,
                        bookmarkCount: data.bookmarkCount || 0,
                        summary: data.summary || data.description || '',
                        description: data.description || data.summary || '',
                        featured: data.featured || false,
                        totalChapters: data.totalChapters || 0,
                        isPremium: data.isPremium || false
                    });
                });
                
                setNovels(novelsData);
                setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
                setHasMore(snapshot.docs.length === NOVELS_PER_PAGE);
                console.log(`Loaded ${novelsData.length} novels`);
            } else {
                setHasMore(false);
            }
        } catch (error) {
            console.error('Error loading novels:', error);
        } finally {
            setLoading(false);
        }
    };
    
    // ✅ Load more novels - NO CHAPTERS
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
                        title: data.title || 'Untitled',
                        author: data.author || 'Unknown',
                        coverImage: data.coverImage || data.coverUrl || null,
                        coverUrl: data.coverImage || data.coverUrl || null,
                        genre: data.genre || 'General',
                        status: data.status || 'Ongoing',
                        rating: data.rating || 0,
                        views: data.views || 0,
                        bookmarkCount: data.bookmarkCount || 0,
                        summary: data.summary || data.description || '',
                        description: data.description || data.summary || '',
                        featured: data.featured || false,
                        totalChapters: data.totalChapters || 0,
                        isPremium: data.isPremium || false
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
    
    // ✅ Get novel details WITHOUT chapters
    const getNovelDetails = async (novelId) => {
        const existingNovel = novels.find(n => n.id === novelId);
        if (existingNovel) return existingNovel;
        
        try {
            const doc = await db.collection('novels').doc(novelId).get();
            if (doc.exists) {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    coverImage: data.coverImage || data.coverUrl || null,
                    coverUrl: data.coverImage || data.coverUrl || null
                };
            }
            return null;
        } catch (error) {
            console.error('Error getting novel details:', error);
            return null;
        }
    };
    
    // ✅ MOST IMPORTANT: Get ONLY chapter titles - NO CONTENT!
    const getChaptersList = async (novelId) => {
        try {
            console.log(`Loading chapter titles for novel: ${novelId}`);
            
            const snapshot = await db.collection('novels')
                .doc(novelId)
                .collection('chapters')
                .orderBy('chapterNumber', 'asc')
                .get();
                
            const chapters = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                // ✅ NO CONTENT FIELD HERE!
                chapters.push({
                    id: doc.id,
                    number: data.chapterNumber || data.number || 1,
                    chapterNumber: data.chapterNumber || data.number || 1,
                    title: data.title || `Chapter ${data.chapterNumber || 1}`,
                    readTime: data.readTime || '5 min'
                    // ❌ NO content field!
                });
            });
            
            console.log(`Loaded ${chapters.length} chapter titles (no content)`);
            return chapters;
        } catch (error) {
            console.error('Error loading chapters:', error);
            return [];
        }
    };
    
    // ✅ Get SINGLE chapter content - Only when user clicks
    const getChapterContent = async (novelId, chapterId) => {
        const cacheKey = `${novelId}_${chapterId}`;
        
        // Check cache
        if (cachedChapters.has(cacheKey)) {
            console.log(`Chapter ${chapterId} from cache`);
            return cachedChapters.get(cacheKey);
        }
        
        try {
            console.log(`Loading chapter ${chapterId} content...`);
            
            const doc = await db.collection('novels')
                .doc(novelId)
                .collection('chapters')
                .doc(chapterId)
                .get();
                
            if (doc.exists) {
                const data = doc.data();
                const chapterData = {
                    content: data.content || 'Chapter content not available.',
                    title: data.title || `Chapter ${data.chapterNumber || 1}`,
                    number: data.chapterNumber || data.number || 1
                };
                
                // Cache only last 5 chapters
                if (cachedChapters.size >= 5) {
                    const firstKey = cachedChapters.keys().next().value;
                    cachedChapters.delete(firstKey);
                }
                
                setCachedChapters(prev => new Map(prev).set(cacheKey, chapterData));
                return chapterData;
            }
            
            return { 
                content: 'Chapter not found.', 
                title: 'Chapter Not Found', 
                number: 1 
            };
        } catch (error) {
            console.error('Error loading chapter:', error);
            return { 
                content: 'Error loading chapter.', 
                title: 'Error', 
                number: 1 
            };
        }
    };
    
    // ✅ Search novels
    const searchNovels = async (searchTerm) => {
        if (!searchTerm || searchTerm.length < 2) return [];
        
        try {
            const searchLower = searchTerm.toLowerCase();
            
            const localResults = novels.filter(novel => 
                novel.title.toLowerCase().includes(searchLower) ||
                novel.author.toLowerCase().includes(searchLower)
            );
            
            return localResults.slice(0, 10);
        } catch (error) {
            console.error('Error searching:', error);
            return [];
        }
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
            console.error("Error incrementing view count:", error);
        }
    };
    
    // Initial load
    useEffect(() => {
        loadInitialNovels();
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

window.DataProvider = DataProvider;
window.DataContext = DataContext;
window.useData = () => useContext(DataContext);
