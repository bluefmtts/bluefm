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
    const [cachedNovels, setCachedNovels] = useState(new Map());
    const [cachedChapters, setCachedChapters] = useState(new Map());
    const { user } = useContext(AuthContext);
    
    const NOVELS_PER_PAGE = 10;
    
    // Initial load - fetch ONLY novels, NO CHAPTERS
    const loadInitialNovels = async () => {
        try {
            setLoading(true);
            console.log('Loading novels from Firebase...');
            
            const query = db.collection('novels')
                .where('published', '==', true)
                .orderBy('createdAt', 'desc')
                .limit(NOVELS_PER_PAGE);
                
            const snapshot = await query.get();
            
            if (!snapshot.empty) {
                const novelsData = [];
                
                // Load ONLY novel data, NO CHAPTERS
                snapshot.forEach(doc => {
                    const data = doc.data();
                    
                    const novel = {
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
                        published: data.published || true,
                        totalChapters: data.totalChapters || 0,
                        isPremium: data.isPremium || false,
                        createdAt: data.createdAt,
                        updatedAt: data.updatedAt
                        // NO chapters field here
                    };
                    
                    novelsData.push(novel);
                });
                
                setNovels(novelsData);
                setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
                setHasMore(snapshot.docs.length === NOVELS_PER_PAGE);
                console.log(`Loaded ${novelsData.length} novels (without chapters)`);
                setLoading(false);
            } else {
                console.log('No novels found in database');
                setNovels([]);
                setHasMore(false);
                setLoading(false);
            }
        } catch (error) {
            console.error('Error loading novels:', error);
            setLoading(false);
            setNovels([]);
        }
    };
    
    // Load more novels when user scrolls - NO CHAPTERS
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
                    
                    const novel = {
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
                        published: data.published || true,
                        totalChapters: data.totalChapters || 0,
                        isPremium: data.isPremium || false,
                        createdAt: data.createdAt,
                        updatedAt: data.updatedAt
                        // NO chapters
                    };
                    
                    novelsData.push(novel);
                });
                
                setNovels(prev => [...prev, ...novelsData]);
                setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
                setHasMore(snapshot.docs.length === NOVELS_PER_PAGE);
                console.log(`Loaded ${novelsData.length} more novels`);
            } else {
                setHasMore(false);
            }
        } catch (error) {
            console.error('Error loading more novels:', error);
        } finally {
            setLoadingMore(false);
        }
    };
    
    // Get single novel details - NO CHAPTERS
    const getNovelDetails = async (novelId) => {
        // Check cache first
        if (cachedNovels.has(novelId)) {
            return cachedNovels.get(novelId);
        }
        
        // Check in already loaded novels
        const existingNovel = novels.find(n => n.id === novelId);
        if (existingNovel) {
            return existingNovel;
        }
        
        try {
            const doc = await db.collection('novels').doc(novelId).get();
            if (doc.exists) {
                const data = doc.data();
                const novelData = {
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
                    published: data.published || true,
                    totalChapters: data.totalChapters || 0,
                    isPremium: data.isPremium || false,
                    createdAt: data.createdAt,
                    updatedAt: data.updatedAt
                    // NO chapters
                };
                
                // Cache the novel
                setCachedNovels(prev => new Map(prev).set(novelId, novelData));
                return novelData;
            }
            return null;
        } catch (error) {
            console.error('Error getting novel details:', error);
            return null;
        }
    };
    
    // Get chapters list - ONLY WHEN USER CLICKS CHAPTERS TAB
    const getChaptersList = async (novelId) => {
        try {
            console.log(`Loading chapters for novel: ${novelId}`);
            
            // Check if already cached
            const cacheKey = `chapters_${novelId}`;
            if (cachedChapters.has(cacheKey)) {
                return cachedChapters.get(cacheKey);
            }
            
            // Load from Firebase subcollection
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
                    number: data.chapterNumber || data.number || 1,
                    chapterNumber: data.chapterNumber || data.number || 1,
                    title: data.title || `Chapter ${data.chapterNumber || doc.id}`,
                    // NO content here - will load separately
                    isPremium: data.isPremium || false,
                    isLocked: data.isLocked || false,
                    readTime: data.readTime || '5 min'
                });
            });
            
            if (chapters.length === 0) {
                // Try alternative structure (chapters as array field)
                const novelDoc = await db.collection('novels').doc(novelId).get();
                if (novelDoc.exists) {
                    const data = novelDoc.data();
                    if (data.chapters && Array.isArray(data.chapters)) {
                        console.log(`Found ${data.chapters.length} chapters in novel document`);
                        data.chapters.forEach((ch, index) => {
                            chapters.push({
                                id: ch.id || `ch${index + 1}`,
                                number: ch.number || ch.chapterNumber || index + 1,
                                chapterNumber: ch.chapterNumber || ch.number || index + 1,
                                title: ch.title || `Chapter ${index + 1}`,
                                // NO content
                                isPremium: ch.isPremium || false,
                                isLocked: ch.isLocked || false,
                                readTime: ch.readTime || '5 min'
                            });
                        });
                    }
                }
            }
            
            // Cache chapters list
            cachedChapters.set(cacheKey, chapters);
            
            console.log(`Loaded ${chapters.length} chapters (titles only)`);
            return chapters;
        } catch (error) {
            console.error('Error loading chapters:', error);
            return [];
        }
    };
    
    // Get single chapter content - ONLY WHEN USER OPENS READER
    const getChapterContent = async (novelId, chapterId) => {
        const cacheKey = `${novelId}_${chapterId}`;
        
        // Check cache first
        if (cachedChapters.has(cacheKey)) {
            return cachedChapters.get(cacheKey);
        }
        
        try {
            console.log(`Loading content for chapter: ${chapterId}`);
            
            // Try subcollection first
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
                    const firstKey = cachedChapters.keys().next().value;
                    cachedChapters.delete(firstKey);
                }
                cachedChapters.set(cacheKey, chapterData);
                console.log('Chapter content loaded successfully');
                return chapterData;
            }
            
            // Try from novel document chapters array
            const novelDoc = await db.collection('novels').doc(novelId).get();
            if (novelDoc.exists) {
                const data = novelDoc.data();
                if (data.chapters && Array.isArray(data.chapters)) {
                    const chapter = data.chapters.find(ch => ch.id === chapterId);
                    if (chapter) {
                        cachedChapters.set(cacheKey, chapter);
                        return chapter;
                    }
                }
            }
            
            console.log('Chapter content not found');
            return null;
        } catch (error) {
            console.error('Error loading chapter content:', error);
            return null;
        }
    };
    
    // Search novels
    const searchNovels = async (searchTerm) => {
        if (!searchTerm || searchTerm.length < 2) return [];
        
        try {
            const searchLower = searchTerm.toLowerCase();
            
            // Search in already loaded novels first
            const localResults = novels.filter(novel => 
                novel.title.toLowerCase().includes(searchLower) ||
                novel.author.toLowerCase().includes(searchLower)
            );
            
            if (localResults.length >= 5) {
                return localResults.slice(0, 10);
            }
            
            // Search in Firebase
            const titleQuery = db.collection('novels')
                .where('published', '==', true)
                .where('title', '>=', searchTerm)
                .where('title', '<=', searchTerm + '\uf8ff')
                .limit(10);
                
            const snapshot = await titleQuery.get();
            const results = [];
            
            snapshot.forEach(doc => {
                const data = doc.data();
                results.push({
                    id: doc.id,
                    title: data.title,
                    author: data.author,
                    coverImage: data.coverImage || data.coverUrl,
                    genre: data.genre
                });
            });
            
            return results;
        } catch (error) {
            console.error('Error searching novels:', error);
            return [];
        }
    };
    
    // Load user data
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
        
        try {
            const novelRef = db.collection('novels').doc(novelId);
            const increment = bookmarks.includes(novelId) ? -1 : 1;
            await novelRef.update({
                bookmarkCount: firebase.firestore.FieldValue.increment(increment)
            });
        } catch (error) {
            console.error('Error updating bookmark count:', error);
        }
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
    
    // Initial load - WITH TIMEOUT PROTECTION
    useEffect(() => {
        let mounted = true;
        
        const loadData = async () => {
            // Set a timeout to prevent hanging
            const timeoutId = setTimeout(() => {
                if (mounted && loading) {
                    console.log('Initial load timeout - showing empty state');
                    setLoading(false);
                    setNovels([]);
                }
            }, 5000); // 5 second timeout
            
            await loadInitialNovels();
            
            clearTimeout(timeoutId);
        };
        
        loadData();
        
        return () => {
            mounted = false;
        };
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
window.useData = () => useContext(DataContext);
