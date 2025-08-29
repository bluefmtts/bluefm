const { useState, useEffect, useContext } = React;

const NovelDetailPage = ({ novel: initialNovel, setCurrentView, setSelectedChapter }) => {
    const [novel, setNovel] = useState(initialNovel);
    const [chapters, setChapters] = useState([]);
    const [expandedSummary, setExpandedSummary] = useState(false);
    const [activeTab, setActiveTab] = useState('about'); // 'about' or 'chapters'
    const [loading, setLoading] = useState(true);
    const [chaptersLoading, setChaptersLoading] = useState(false);
    
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
    
    // Load full novel details on mount
    useEffect(() => {
        loadNovelDetails();
    }, [novel.id]);
    
    const loadNovelDetails = async () => {
        setLoading(true);
        try {
            // Get full novel details (but not chapters)
            const fullNovel = await getNovelDetails(novel.id);
            if (fullNovel) {
                setNovel(fullNovel);
                incrementViewCount(novel.id);
            }
        } catch (error) {
            console.error('Error loading novel details:', error);
        } finally {
            setLoading(false);
        }
    };
    
    // Load chapters ONLY when user clicks on Chapters tab
    const handleTabChange = async (tab) => {
        setActiveTab(tab);
        
        // Load chapters if switching to chapters tab and not loaded yet
        if (tab === 'chapters' && chapters.length === 0 && !chaptersLoading) {
            setChaptersLoading(true);
            try {
                const chaptersList = await getChaptersList(novel.id);
                setChapters(chaptersList);
            } catch (error) {
                console.error('Error loading chapters:', error);
            } finally {
                setChaptersLoading(false);
            }
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
                
                {/* Novel Info */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 p-6 mb-6 animate-fadeIn">
                    <div className="flex flex-col sm:flex-row gap-6">
                        <img 
                            src={novel.coverImage || novel.coverUrl || `https://picsum.photos/200/300?random=${novel.id}`}
                            alt={novel.title}
                            className="w-full sm:w-48 h-72 object-cover rounded-xl shadow-lg"
                            loading="lazy"
                        />
                        
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-gray-100">
                                {novel.title}
                            </h1>
                            <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
                                by {novel.author}
                            </p>
                            
                            <div className="flex flex-wrap gap-2 mb-4">
                                <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-full text-sm">
                                    {novel.genre}
                                </span>
                                <span className={`px-3 py-1 rounded-full text-sm ${
                                    novel.status === 'Completed'
                                        ? 'bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400'
                                        : 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-600 dark:text-yellow-400'
                                }`}>
                                    {novel.status || 'Ongoing'}
                                </span>
                                <div className="flex items-center gap-1 px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full">
                                    <Icon name="star" className="w-4 h-4 text-yellow-500 fill-current" />
                                    <span className="text-sm text-gray-700 dark:text-gray-300">
                                        {novel.rating?.toFixed(1) || '0.0'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1 px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full">
                                    <Icon name="eye" className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                    <span className="text-sm text-gray-700 dark:text-gray-300">{novel.views || 0}</span>
                                </div>
                                {novel.totalChapters > 0 && (
                                    <div className="flex items-center gap-1 px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full">
                                        <Icon name="book-open" className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                        <span className="text-sm text-gray-700 dark:text-gray-300">
                                            {novel.totalChapters} chapters
                                        </span>
                                    </div>
                                )}
                            </div>
                            
                            {/* Action Buttons */}
                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        if (chapters.length > 0) {
                                            setSelectedChapter({ novel, chapter: chapters[0] });
                                            setCurrentView('reader');
                                        } else {
                                            handleTabChange('chapters');
                                        }
                                    }}
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
                            Chapters ({novel.totalChapters || 0})
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
                                    {novel.description || novel.summary || 'No description available.'}
                                </p>
                                {novel.description && novel.description.length > 200 && (
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
                                
                                {/* Additional Info */}
                                <div className="mt-6 grid grid-cols-2 gap-4">
                                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Last Updated</p>
                                        <p className="font-medium text-gray-900 dark:text-gray-100">
                                            {novel.updatedAt ? new Date(novel.updatedAt).toLocaleDateString() : 'N/A'}
                                        </p>
                                    </div>
                                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Total Words</p>
                                        <p className="font-medium text-gray-900 dark:text-gray-100">
                                            {novel.totalWords ? novel.totalWords.toLocaleString() : 'N/A'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        {/* Chapters Tab */}
                        {activeTab === 'chapters' && (
                            <div className="animate-fadeIn">
                                {chaptersLoading ? (
                                    <div className="flex justify-center items-center py-12">
                                        <div className="flex items-center gap-3">
                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                                            <span className="text-gray-600 dark:text-gray-400">Loading chapters...</span>
                                        </div>
                                    </div>
                                ) : chapters.length > 0 ? (
                                    <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                                        {chapters.map((chapter) => {
                                            const progressKey = `${novel.id}:${chapter.id}`;
                                            const progress = readProgress[progressKey] || 0;
                                            
                                            return (
                                                <div
                                                    key={chapter.id}
                                                    onClick={() => {
                                                        setSelectedChapter({ novel, chapter });
                                                        setCurrentView('reader');
                                                    }}
                                                    className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-all group"
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-3">
                                                                <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                                                                    Ch. {chapter.chapterNumber || chapter.number}
                                                                </span>
                                                                <h3 className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                                                    {chapter.title}
                                                                </h3>
                                                                {chapter.isPremium && (
                                                                    <span className="px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-400 text-xs rounded-full">
                                                                        Premium
                                                                    </span>
                                                                )}
                                                            </div>
                                                            {progress > 0 && (
                                                                <div className="flex items-center gap-2 mt-2">
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
                                                        <Icon name="chevron-right" className="w-5 h-5 text-gray-400 dark:text-gray-600 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <p className="text-center text-gray-500 dark:text-gray-400 py-12">
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
