const { useState, useEffect, useRef, useContext } = React;

const ReaderPage = ({ chapterData, setCurrentView }) => {
    const { novel, chapter: initialChapter } = chapterData;
    const [currentChapter, setCurrentChapter] = useState(initialChapter);
    const [chapterContent, setChapterContent] = useState(null);
    const [chapters, setChapters] = useState([]);
    const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [navigating, setNavigating] = useState(false);
    
    const [fontSize, setFontSize] = useState(() => {
        const saved = localStorage.getItem('readerFontSize');
        return saved ? parseInt(saved) : 16;
    });
    
    const { 
        addToHistory, 
        updateReadProgress,
        getChaptersList,
        getChapterContent 
    } = useContext(DataContext);
    const { isDark, toggleTheme } = useContext(ThemeContext);
    const contentRef = useRef(null);
    
    // Initialize reader
    useEffect(() => {
        initializeReader();
    }, [novel.id, initialChapter.id]);
    
    const initializeReader = async () => {
        setLoading(true);
        try {
            // Get chapters list
            const chaptersList = await getChaptersList(novel.id);
            setChapters(chaptersList);
            
            // Find current chapter index
            const index = chaptersList.findIndex(ch => ch.id === initialChapter.id);
            setCurrentChapterIndex(index >= 0 ? index : 0);
            
            // Load chapter content
            let content = initialChapter.content;
            if (!content) {
                const chapterData = await getChapterContent(novel.id, initialChapter.id);
                content = chapterData?.content || '';
            }
            
            setChapterContent(content);
            setCurrentChapter(chaptersList[index] || initialChapter);
            
            // Add to history
            addToHistory(novel.id, initialChapter.id, initialChapter.title);
        } catch (error) {
            console.error('Error initializing reader:', error);
            setChapterContent(initialChapter.content || 'Chapter content not available.');
        } finally {
            setLoading(false);
        }
    };
    
    // Save font size
    useEffect(() => {
        localStorage.setItem('readerFontSize', fontSize.toString());
    }, [fontSize]);
    
    // Track reading progress
    useEffect(() => {
        if (!chapterContent || !contentRef.current) return;
        
        const handleScroll = () => {
            const element = contentRef.current;
            const scrollProgress = element.scrollTop / (element.scrollHeight - element.clientHeight);
            updateReadProgress(novel.id, currentChapter.id, scrollProgress);
        };
        
        const element = contentRef.current;
        element.addEventListener('scroll', handleScroll);
        return () => element.removeEventListener('scroll', handleScroll);
    }, [chapterContent, currentChapter, novel.id]);
    
    // Navigate to different chapter
    const navigateChapter = async (direction) => {
        const newIndex = currentChapterIndex + direction;
        
        if (newIndex < 0 || newIndex >= chapters.length) return;
        
        setNavigating(true);
        try {
            const targetChapter = chapters[newIndex];
            
            // Load new chapter content
            const chapterData = await getChapterContent(novel.id, targetChapter.id);
            
            if (chapterData) {
                setChapterContent(chapterData.content || '');
                setCurrentChapter(targetChapter);
                setCurrentChapterIndex(newIndex);
                addToHistory(novel.id, targetChapter.id, targetChapter.title);
                
                // Scroll to top
                if (contentRef.current) {
                    contentRef.current.scrollTop = 0;
                }
            }
        } catch (error) {
            console.error('Error navigating chapter:', error);
        } finally {
            setNavigating(false);
        }
    };
    
    const hasPrev = currentChapterIndex > 0;
    const hasNext = currentChapterIndex < chapters.length - 1;
    
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Loading chapter...</p>
                </div>
            </div>
        );
    }
    
    return (
        <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors">
            {/* Header */}
            <div className="sticky top-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
                <div className="max-w-4xl mx-auto px-4 py-3">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => setCurrentView('detail')}
                            className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:underline"
                        >
                            <Icon name="arrow-left" className="w-5 h-5" />
                            <span className="hidden sm:inline">Back</span>
                        </button>
                        
                        <div className="text-center flex-1 mx-4">
                            <h2 className="font-semibold truncate text-gray-900 dark:text-gray-100">
                                {novel.title}
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                {currentChapter.title}
                            </p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                            <div className="flex items-center border border-gray-300 dark:border-gray-700 rounded-lg">
                                <button
                                    onClick={() => setFontSize(Math.max(12, fontSize - 2))}
                                    className="p-2 rounded-l-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                                >
                                    <Icon name="minus" className="w-4 h-4" />
                                </button>
                                <span className="text-xs px-2 text-gray-700 dark:text-gray-300 min-w-[30px] text-center">
                                    {fontSize}
                                </span>
                                <button
                                    onClick={() => setFontSize(Math.min(24, fontSize + 2))}
                                    className="p-2 rounded-r-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                                >
                                    <Icon name="plus" className="w-4 h-4" />
                                </button>
                            </div>
                            
                            <button
                                onClick={toggleTheme}
                                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                            >
                                <Icon name={isDark ? "sun" : "moon"} className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Content */}
            <div 
                ref={contentRef}
                className="max-w-3xl mx-auto px-4 py-8 overflow-y-auto"
                style={{ maxHeight: 'calc(100vh - 200px)' }}
            >
                {navigating ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                            <p className="text-gray-600 dark:text-gray-400">Loading chapter...</p>
                        </div>
                    </div>
                ) : (
                    <>
                        <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">
                            {currentChapter.title}
                        </h1>
                        
                        <div 
                            className="prose dark:prose-invert max-w-none text-gray-800 dark:text-gray-200 protected-content"
                            style={{ 
                                fontSize: `${fontSize}px`,
                                lineHeight: '1.8'
                            }}
                        >
                            <div className="whitespace-pre-wrap">
                                {chapterContent || 'Chapter content not available.'}
                            </div>
                        </div>
                    </>
                )}
            </div>
            
            {/* Navigation */}
            <div className="sticky bottom-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
                <div className="max-w-3xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => navigateChapter(-1)}
                            disabled={!hasPrev || navigating}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                                hasPrev && !navigating
                                    ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                                    : 'bg-gray-200 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                            }`}
                        >
                            <Icon name="chevron-left" className="w-5 h-5" />
                            Previous
                        </button>
                        
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                            Chapter {currentChapterIndex + 1} of {chapters.length}
                        </span>
                        
                        <button
                            onClick={() => navigateChapter(1)}
                            disabled={!hasNext || navigating}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                                hasNext && !navigating
                                    ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                                    : 'bg-gray-200 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                            }`}
                        >
                            Next
                            <Icon name="chevron-right" className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

window.ReaderPage = ReaderPage;
