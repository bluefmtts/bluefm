const { useState, useEffect, useRef, useContext } = React;

const ReaderPage = ({ chapterData, setCurrentView }) => {
    const { novel, chapter } = chapterData;
    const [fontSize, setFontSize] = useState(() => {
        const saved = localStorage.getItem('readerFontSize');
        return saved ? parseInt(saved) : 16;
    });
    const { addToHistory, updateReadProgress } = useContext(DataContext);
    const { isDark, toggleTheme } = useContext(ThemeContext);
    const contentRef = useRef(null);
    const [currentChapterIndex, setCurrentChapterIndex] = useState(
        novel.chapters.findIndex(ch => ch.id === chapter.id)
    );
    
    useEffect(() => {
        addToHistory(novel.id, chapter.id);
    }, [novel.id, chapter.id]);
    
    useEffect(() => {
        localStorage.setItem('readerFontSize', fontSize.toString());
    }, [fontSize]);
    
    const currentChapter = novel.chapters[currentChapterIndex];
    const hasPrev = currentChapterIndex > 0;
    const hasNext = currentChapterIndex < novel.chapters.length - 1;
    
    const navigateChapter = (direction) => {
        const newIndex = currentChapterIndex + direction;
        if (newIndex >= 0 && newIndex < novel.chapters.length) {
            setCurrentChapterIndex(newIndex);
            if (contentRef.current) {
                contentRef.current.scrollTop = 0;
            }
            addToHistory(novel.id, novel.chapters[newIndex].id);
        }
    };
    
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
                        {currentChapter.content}
                    </div>
                </div>
            </div>
            
            {/* Navigation */}
            <div className="sticky bottom-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
                <div className="max-w-3xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => navigateChapter(-1)}
                            disabled={!hasPrev}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                                hasPrev
                                    ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                                    : 'bg-gray-200 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                            }`}
                        >
                            <Icon name="chevron-left" className="w-5 h-5" />
                            Previous
                        </button>
                        
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                            Chapter {currentChapter.number} of {novel.chapters.length}
                        </span>
                        
                        <button
                            onClick={() => navigateChapter(1)}
                            disabled={!hasNext}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                                hasNext
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
