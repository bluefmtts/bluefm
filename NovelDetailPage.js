const { useState, useEffect, useContext } = React;

const NovelDetailPage = ({ novel, setCurrentView, setSelectedChapter }) => {
    const [expandedSummary, setExpandedSummary] = useState(false);
    const [chapters, setChapters] = useState([]);
    const [chaptersLoading, setChaptersLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('about');
    const [novelDetails, setNovelDetails] = useState(novel);
    
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
    
    // Load full novel details
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
    
    // Load chapters when tab changes to chapters
    const handleTabChange = async (tab) => {
        setActiveTab(tab);
        
        if (tab === 'chapters' && chapters.length === 0 && !chaptersLoading) {
            setChaptersLoading(true);
            try {
                const chaptersList = await getChaptersList(novel.id);
                setChapters(chaptersList);
                console.log(`Loaded ${chaptersList.length} chapters for ${novel.title}`);
            } catch (error) {
                console.error('Error loading chapters:', error);
            } finally {
                setChaptersLoading(false);
            }
        }
    };
    
    const handleStartReading = () => {
        if (chapters.length > 0) {
            setSelectedChapter({ novel: novelDetails, chapter: chapters[0] });
            setCurrentView('reader');
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
                
                {/* Novel Info */}
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
                            Chapters ({novelDetails.totalChapters || chapters.length || 0})
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
                        
                        {/* Chapters Tab */}
                        {activeTab === 'chapters' && (
                            <div className="animate-fadeIn">
                                {chaptersLoading ? (
                                    <div className="flex justify-center items-center py-12">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                                        <span className="ml-3 text-gray-600 dark:text-gray-400">Loading chapters...</span>
                                    </div>
                                ) : chapters.length > 0 ? (
                                    <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                                        {chapters.map((chapter) => {
                                            const progressKey = `${novel.id}:${chapter.id}`;
                                            const progress = readProgress[progressKey] || 0;
                                            
                                            return (
                                                <div
                                                    key={chapter.id}
                                                    onClick={() => {
                                                        setSelectedChapter({ novel: novelDetails, chapter });
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
                                                            </div>
                                                            <div className="flex items-center gap-4 mt-1">
                                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                                    {chapter.readTime || '10 min'}
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
                                ) : (
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
