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
    
    // Load novel details only
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
    
    // Simple chapter loading
    const loadChapters = async () => {
        if (chaptersLoading || chapters.length > 0) return;
        
        setChaptersLoading(true);
        try {
            const chaptersList = await getChaptersList(novel.id);
            // Use setTimeout to avoid React DOM error
            setTimeout(() => {
                setChapters(chaptersList || []);
                setChaptersLoading(false);
            }, 100);
        } catch (error) {
            console.error('Error loading chapters:', error);
            setTimeout(() => {
                setChaptersLoading(false);
            }, 100);
        }
    };
    
    const handleStartReading = () => {
        if (chapters.length > 0) {
            const firstChapter = chapters[0];
            setSelectedChapter({ 
                novel: novelDetails, 
                chapterId: firstChapter.id,
                chapterNumber: firstChapter.chapterNumber || firstChapter.number,
                chapterTitle: firstChapter.title
            });
            setCurrentView('reader');
        } else {
            setActiveTab('chapters');
            loadChapters();
        }
    };
    
    const handleChapterClick = (chapter) => {
        setSelectedChapter({ 
            novel: novelDetails, 
            chapterId: chapter.id,
            chapterNumber: chapter.chapterNumber || chapter.number,
            chapterTitle: chapter.title
        });
        setCurrentView('reader');
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
                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 p-6 mb-6">
                    <div className="flex flex-col sm:flex-row gap-6">
                        <img 
                            src={novelDetails.coverImage || `https://picsum.photos/200/300?random=${novelDetails.id}`}
                            alt={novelDetails.title}
                            className="w-full sm:w-48 h-72 object-cover rounded-xl shadow-lg"
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
                                {novelDetails.totalChapters > 0 && (
                                    <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-sm text-gray-700 dark:text-gray-300">
                                        {novelDetails.totalChapters} chapters
                                    </span>
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
                                                : 'border-gray-300 dark:border-gray-700 hover:border-indigo-600'
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
                
                {/* Tabs */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800">
                    <div className="flex border-b border-gray-200 dark:border-gray-800">
                        <button
                            onClick={() => setActiveTab('about')}
                            className={`flex-1 px-6 py-4 font-medium transition-colors ${
                                activeTab === 'about'
                                    ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600'
                                    : 'text-gray-600 dark:text-gray-400'
                            }`}
                        >
                            About
                        </button>
                        <button
                            onClick={() => {
                                setActiveTab('chapters');
                                loadChapters();
                            }}
                            className={`flex-1 px-6 py-4 font-medium transition-colors ${
                                activeTab === 'chapters'
                                    ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600'
                                    : 'text-gray-600 dark:text-gray-400'
                            }`}
                        >
                            Chapters ({novelDetails.totalChapters || 0})
                        </button>
                    </div>
                    
                    <div className="p-6">
                        {activeTab === 'about' && (
                            <div>
                                <h3 className="font-semibold mb-3 text-gray-900 dark:text-gray-100">Summary</h3>
                                <p className={`text-gray-600 dark:text-gray-400 leading-relaxed ${
                                    !expandedSummary ? 'line-clamp-4' : ''
                                }`}>
                                    {novelDetails.description || 'No description available.'}
                                </p>
                                {novelDetails.description && novelDetails.description.length > 200 && (
                                    <button
                                        onClick={() => setExpandedSummary(!expandedSummary)}
                                        className="text-indigo-600 dark:text-indigo-400 hover:underline text-sm mt-3"
                                    >
                                        {expandedSummary ? 'Show Less' : 'Read More'}
                                    </button>
                                )}
                            </div>
                        )}
                        
                        {activeTab === 'chapters' && (
                            <div>
                                {chaptersLoading ? (
                                    <div className="text-center py-8">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-2"></div>
                                        <p className="text-gray-500 dark:text-gray-400">Loading chapters...</p>
                                    </div>
                                ) : chapters.length > 0 ? (
                                    <div className="space-y-2 max-h-96 overflow-y-auto">
                                        {chapters.map((chapter) => (
                                            <div
                                                key={chapter.id}
                                                onClick={() => handleChapterClick(chapter)}
                                                className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-all"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">
                                                            Ch. {chapter.chapterNumber || chapter.number}
                                                        </span>
                                                        <span className="font-semibold text-gray-900 dark:text-gray-100">
                                                            {chapter.title}
                                                        </span>
                                                    </div>
                                                    <Icon name="chevron-right" className="w-5 h-5 text-gray-400" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                                        No chapters available
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
