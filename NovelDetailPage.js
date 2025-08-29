const { useState, useEffect, useContext } = React;

const NovelDetailPage = ({ novel, setCurrentView, setSelectedChapter }) => {
    const [expandedSummary, setExpandedSummary] = useState(false);
    const [chapters, setChapters] = useState([]);
    const [chaptersLoading, setChaptersLoading] = useState(false);
    const [showChapters, setShowChapters] = useState(false);
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
    
    // Load chapters when user clicks "All Chapters" button
    const handleShowChapters = async () => {
        if (chapters.length > 0) {
            // Already loaded, just toggle visibility
            setShowChapters(!showChapters);
            return;
        }
        
        setChaptersLoading(true);
        try {
            const chaptersList = await getChaptersList(novel.id);
            // Show only first 10 chapters
            setChapters(chaptersList.slice(0, 10));
            setShowChapters(true);
            console.log(`Loaded ${Math.min(chaptersList.length, 10)} chapters for ${novel.title}`);
        } catch (error) {
            console.error('Error loading chapters:', error);
        } finally {
            setChaptersLoading(false);
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
                            src={novelDetails.coverImage || novelDetails.coverUrl || `data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iIzY2NkY4OCIvPjx0ZXh0IHRleHQtYW5jaG9yPSJtaWRkbGUiIHg9IjEwMCIgeT0iMTUwIiBzdHlsZT0iZmlsbDojZmZmO2ZvbnQtc2l6ZToyMHB4O2ZvbnQtZmFtaWx5OkFyaWFsIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=`}
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
                            
                            <div className="mb-4">
                                <h3 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">Summary</h3>
                                <p className={`text-gray-600 dark:text-gray-400 leading-relaxed ${
                                    !expandedSummary ? 'line-clamp-3' : ''
                                }`}>
                                    {novelDetails.summary || novelDetails.description || 'No description available.'}
                                </p>
                                {(novelDetails.summary || novelDetails.description) && (novelDetails.summary || novelDetails.description).length > 150 && (
                                    <button
                                        onClick={() => setExpandedSummary(!expandedSummary)}
                                        className="text-indigo-600 dark:text-indigo-400 hover:underline text-sm mt-2 flex items-center gap-1"
                                    >
                                        <Icon 
                                            name="chevron-down" 
                                            className={`w-4 h-4 transition-transform ${expandedSummary ? 'rotate-180' : ''}`} 
                                        />
                                        {expandedSummary ? 'Show Less' : 'Read More'}
                                    </button>
                                )}
                            </div>
                            
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
                                    {isBookmarked ? 'Bookmarked' : 'Add to Bookmarks'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
                
                {/* Chapters Section */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 p-6 animate-slideUp">
                    {/* All Chapters Button */}
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                            Chapters
                        </h2>
                        <button
                            onClick={handleShowChapters}
                            disabled={chaptersLoading}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                        >
                            {chaptersLoading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                    Loading...
                                </>
                            ) : (
                                <>
                                    <Icon name={showChapters ? "chevron-up" : "list"} className="w-4 h-4" />
                                    {showChapters ? 'Hide Chapters' : 'All Chapters'}
                                </>
                            )}
                        </button>
                    </div>
                    
                    {/* Chapters List - Only show when clicked */}
                    {showChapters && chapters.length > 0 && (
                        <div className="space-y-2 max-h-96 overflow-y-auto pr-2 animate-fadeIn">
                            {chapters.map((chapter) => {
                                const progressKey = `${novel.id}:${chapter.id}`;
                                const progress = readProgress[progressKey] || 0;
                                
                                return (
                                    <div
                                        key={chapter.id}
                                        onClick={() => {
                                            // Only pass chapter ID and basic info, not content
                                            setSelectedChapter({ 
                                                novel: novelDetails, 
                                                chapter: {
                                                    id: chapter.id,
                                                    number: chapter.number,
                                                    chapterNumber: chapter.chapterNumber,
                                                    title: chapter.title
                                                }
                                            });
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
                                                {progress > 0 && (
                                                    <div className="flex items-center gap-2 mt-1">
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
                            
                            {/* Show more message if there are more chapters */}
                            {novelDetails.totalChapters > 10 && (
                                <p className="text-center text-sm text-gray-500 dark:text-gray-400 py-2">
                                    Showing first 10 chapters of {novelDetails.totalChapters}
                                </p>
                            )}
                        </div>
                    )}
                    
                    {/* Empty state when chapters button not clicked */}
                    {!showChapters && (
                        <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                            Click "All Chapters" to view chapter list
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

window.NovelDetailPage = NovelDetailPage;
