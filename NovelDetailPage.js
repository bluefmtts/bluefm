const { useState, useEffect, useContext } = React;

const NovelDetailPage = ({ novel, setCurrentView, setSelectedChapter }) => {
    const [expandedSummary, setExpandedSummary] = useState(false);
    const [chapters, setChapters] = useState([]);
    const [chaptersLoading, setChaptersLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('about');
    const [novelDetails, setNovelDetails] = useState(novel);
    const [showAllChaptersButton, setShowAllChaptersButton] = useState(true);
    const [chaptersVisible, setChaptersVisible] = useState(false);
    
    const { 
        bookmarks, 
        toggleBookmark, 
        readProgress, 
        incrementViewCount,
        getNovelDetails,
        getChaptersList 
    } = useContext(DataContext);
    
    const { user } = useContext(AuthContext);
    const isBookmarked = bookmarks.includes(novel.id);
    
    // Load only novel details (NOT chapters)
    useEffect(() => {
        loadNovelDetails();
        incrementViewCount(novel.id);
    }, [novel.id]);
    
    const loadNovelDetails = async () => {
        const details = await getNovelDetails(novel.id);
        if (details) {
            setNovelDetails(details);
        }
    };
    
    // Load ONLY chapter list (titles, no content)
    const loadChaptersList = async () => {
        if (chapters.length > 0) {
            setChaptersVisible(true);
            return;
        }
        
        setChaptersLoading(true);
        try {
            // Sirf chapter titles load karo, content nahi
            const chaptersList = await getChaptersList(novel.id);
            
            // Map karo sirf necessary data
            const lightChapters = chaptersList.map(ch => ({
                id: ch.id,
                chapterNumber: ch.chapterNumber || ch.number,
                title: ch.title,
                readTime: ch.readTime || '10 min'
            }));
            
            setChapters(lightChapters);
            setChaptersVisible(true);
            setShowAllChaptersButton(false);
            console.log(`Loaded ${lightChapters.length} chapter titles for ${novel.title}`);
        } catch (error) {
            console.error('Error loading chapters:', error);
            alert('Failed to load chapters. Please try again.');
        } finally {
            setChaptersLoading(false);
        }
    };
    
    // Tab change handler - chapters load nahi karna automatically
    const handleTabChange = (tab) => {
        setActiveTab(tab);
        // Chapters automatically load nahi honge
        if (tab === 'chapters') {
            // Show button to load chapters
            setShowAllChaptersButton(true);
            setChaptersVisible(false);
        }
    };
    
    // Chapter select karne pe sirf us chapter ka data load hoga
    const handleChapterSelect = async (chapter) => {
        // Loading indicator dikha sakte ho yahan
        const loadingToast = document.createElement('div');
        loadingToast.className = 'fixed top-4 right-4 bg-indigo-600 text-white px-4 py-2 rounded-lg z-50';
        loadingToast.textContent = 'Loading chapter...';
        document.body.appendChild(loadingToast);
        
        try {
            // Chapter content ReaderPage me load hoga
            setSelectedChapter({ 
                novel: novelDetails, 
                chapterId: chapter.id,
                chapterNumber: chapter.chapterNumber,
                chapterTitle: chapter.title
            });
            setCurrentView('reader');
        } catch (error) {
            console.error('Error selecting chapter:', error);
        } finally {
            // Remove loading toast
            setTimeout(() => {
                if (loadingToast.parentNode) {
                    loadingToast.remove();
                }
            }, 500);
        }
    };
    
    const handleStartReading = () => {
        if (chapters.length > 0) {
            handleChapterSelect(chapters[0]);
        } else {
            handleTabChange('chapters');
        }
    };
    
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Back Button */}
                <button
                    onClick={() => setCurrentView('home')}
                    className="mb-6 flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                    <Icon name="arrow-left" className="w-5 h-5" />
                    Back to Home
                </button>
                
                {/* Novel Info - Same as before */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 p-6 mb-6 animate-fadeIn">
                    <div className="flex flex-col sm:flex-row gap-6">
                        <img 
                            src={novelDetails.coverImage || novelDetails.coverUrl || `https://picsum.photos/200/300?random=${novelDetails.id}`}
                            alt={novelDetails.title}
                            className="w-full sm:w-48 h-72 object-cover rounded-xl shadow-lg"
                            loading="lazy"
                        />
                        
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-gray-100">
                                {novelDetails.title}
                            </h1>
                            <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
                                by {novelDetails.author}
                            </p>
                            
                            <div className="flex flex-wrap gap-2 mb-4">
                                <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-full text-sm">
                                    {novelDetails.genre}
                                </span>
                                <span className={`px-3 py-1 rounded-full text-sm ${
                                    novelDetails.status === 'Completed'
                                        ? 'bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400'
                                        : 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-600 dark:text-yellow-400'
                                }`}>
                                    {novelDetails.status || 'Ongoing'}
                                </span>
                                <div className="flex items-center gap-1 px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full">
                                    <Icon name="star" className="w-4 h-4 text-yellow-500 fill-current" />
                                    <span className="text-sm text-gray-700 dark:text-gray-300">
                                        {novelDetails.rating?.toFixed(1) || '0.0'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1 px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full">
                                    <Icon name="eye" className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                    <span className="text-sm text-gray-700 dark:text-gray-300">
                                        {novelDetails.views || 0}
                                    </span>
                                </div>
                                {novelDetails.totalChapters > 0 && (
                                    <div className="flex items-center gap-1 px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full">
                                        <Icon name="book-open" className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                        <span className="text-sm text-gray-700 dark:text-gray-300">
                                            {novelDetails.totalChapters} chapters
                                        </span>
                                    </div>
                                )}
                            </div>
                            
                            <div className="flex gap-3">
                                <button
                                    onClick={handleStartReading}
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
                                >
                                    <Icon name="book-open" className="w-5 h-5" />
                                    Start Reading
                                </button>
                                
                                {user && (
                                    <button
                                        onClick={() => toggleBookmark(novel.id)}
                                        className={`px-4 py-2 rounded-lg border transition-all flex items-center gap-2 ${
                                            isBookmarked
                                                ? 'bg-indigo-600 text-white border-indigo-600'
                                                : 'border-gray-300 dark:border-gray-700 hover:border-indigo-600 dark:hover:border-indigo-400 text-gray-700 dark:text-gray-300'
                                        }`}
                                    >
                                        <Icon name={isBookmarked ? "bookmark-check" : "bookmark"} className="w-5 h-5" />
                                        {isBookmarked ? 'Bookmarked' : 'Bookmark'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Tabs Section */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 animate-slideUp">
                    {/* Tab Headers */}
                    <div className="flex border-b border-gray-200 dark:border-gray-800">
                        <button
                            onClick={() => handleTabChange('about')}
                            className={`flex-1 px-6 py-4 font-medium transition-colors ${
                                activeTab === 'about'
                                    ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
                                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                            }`}
                        >
                            About
                        </button>
                        <button
                            onClick={() => handleTabChange('chapters')}
                            className={`flex-1 px-6 py-4 font-medium transition-colors ${
                                activeTab === 'chapters'
                                    ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
                                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                            }`}
                        >
                            Chapters ({novelDetails.totalChapters || '?'})
                        </button>
                    </div>
                    
                    {/* Tab Content */}
                    <div className="p-6">
                        {/* About Tab */}
                        {activeTab === 'about' && (
                            <div className="animate-fadeIn">
                                <h3 className="font-semibold mb-3 text-gray-900 dark:text-gray-100">Summary</h3>
                                <p className={`text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-wrap ${
                                    !expandedSummary ? 'line-clamp-4' : ''
                                }`}>
                                    {novelDetails.description || novelDetails.summary || 'No description available.'}
                                </p>
                                {(novelDetails.description || novelDetails.summary) && (novelDetails.description || novelDetails.summary).length > 200 && (
                                    <button
                                        onClick={() => setExpandedSummary(!expandedSummary)}
                                        className="text-indigo-600 dark:text-indigo-400 hover:underline text-sm mt-3 flex items-center gap-1"
                                    >
                                        <Icon 
                                            name="chevron-down" 
                                            className={`w-4 h-4 transition-transform ${expandedSummary ? 'rotate-180' : ''}`} 
                                        />
                                        {expandedSummary ? 'Show Less' : 'Read More'}
                                    </button>
                                )}
                            </div>
                        )}
                        
                        {/* Chapters Tab - OPTIMIZED */}
                        {activeTab === 'chapters' && (
                            <div className="animate-fadeIn">
                                {/* All Chapters Button */}
                                {showAllChaptersButton && !chaptersVisible && (
                                    <div className="text-center py-8">
                                        <button
                                            onClick={loadChaptersList}
                                            disabled={chaptersLoading}
                                            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
                                        >
                                            {chaptersLoading ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                                    Loading...
                                                </>
                                            ) : (
                                                <>
                                                    <Icon name="book-open" className="w-5 h-5" />
                                                    Show All Chapters
                                                </>
                                            )}
                                        </button>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                                            Click to view {novelDetails.totalChapters || 'all'} chapters
                                        </p>
                                    </div>
                                )}
                                
                                {/* Chapters List */}
                                {chaptersVisible && chapters.length > 0 && (
                                    <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                                        {chapters.map((chapter) => {
                                            const progressKey = `${novel.id}:${chapter.id}`;
                                            const progress = readProgress[progressKey] || 0;
                                            
                                            return (
                                                <div
                                                    key={chapter.id}
                                                    onClick={() => handleChapterSelect(chapter)}
                                                    className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-all group"
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-3">
                                                                <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                                                                    Ch. {chapter.chapterNumber}
                                                                </span>
                                                                <h3 className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                                                    {chapter.title}
                                                                </h3>
                                                            </div>
                                                            <div className="flex items-center gap-4 mt-1">
                                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                                    {chapter.readTime}
                                                                </p>
                                                                {progress > 0 && (
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="w-24 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                                            <div 
                                                                                className="h-full bg-indigo-600"
                                                                                style={{ width: `${progress * 100}%` }}
                                                                            />
                                                                        </div>
                                                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                                                            {Math.round(progress * 100)}%
                                                                        </span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <Icon name="chevron-right" className="w-5 h-5 text-gray-400 dark:text-gray-600 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                                
                                {chaptersVisible && chapters.length === 0 && !chaptersLoading && (
                                    <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                                        No chapters available yet
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

window.NovelDetailPage = NovelDetailPage;
