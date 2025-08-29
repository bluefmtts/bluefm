const { useState, useContext, useMemo, useRef, useCallback, useEffect } = React;

const HomePage = ({ setCurrentView, setSelectedNovel }) => {
    const { 
        novels, 
        loading, 
        loadingMore, 
        hasMore, 
        loadMoreNovels,
        connectionError,
        retryConnection
    } = useContext(DataContext);
    
    const [selectedGenre, setSelectedGenre] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');
    const observer = useRef();
    
    const GENRES = ['Romance', 'Fantasy', 'Thriller', 'Sci-Fi', 'Mystery', 'Adventure', 'Drama', 'Action'];
    
    // Infinite scroll observer
    const lastNovelElementRef = useCallback(node => {
        if (loadingMore) return;
        if (observer.current) observer.current.disconnect();
        
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore && !loading && !connectionError) {
                loadMoreNovels();
            }
        }, {
            rootMargin: '100px'
        });
        
        if (node) observer.current.observe(node);
    }, [loadingMore, hasMore, loading, connectionError, loadMoreNovels]);
    
    const featuredNovels = useMemo(() => novels.filter(n => n.featured), [novels]);
    
    const filteredNovels = useMemo(() => {
        return novels.filter(novel => {
            const matchesGenre = selectedGenre === 'All' || novel.genre === selectedGenre;
            const matchesStatus = statusFilter === 'All' || novel.status === statusFilter;
            return matchesGenre && matchesStatus;
        });
    }, [novels, selectedGenre, statusFilter]);
    
    const latestChapters = useMemo(() => {
        return novels
            .filter(n => n.totalChapters > 0)
            .slice(0, 6)
            .map(novel => ({
                novel,
                chapter: { title: `Chapter ${novel.totalChapters}` }
            }));
    }, [novels]);
    
    // Connection Error State
    if (connectionError && !loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
                <div className="max-w-7xl mx-auto px-4 py-8">
                    <div className="text-center py-16">
                        <div className="text-6xl mb-4">🔌</div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                            Connection Problem
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            Unable to load novels. Please check your internet connection.
                        </p>
                        <button
                            onClick={retryConnection}
                            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                        >
                            <Icon name="refresh-cw" className="w-4 h-4 inline mr-2" />
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }
    
    // Loading State
    if (loading && novels.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
                <div className="max-w-7xl mx-auto px-4 py-8">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                            Loading Novels...
                        </h1>
                    </div>
                    <LoadingSkeleton />
                </div>
            </div>
        );
    }
    
    // Empty State
    if (!loading && novels.length === 0 && !connectionError) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
                <div className="max-w-7xl mx-auto px-4 py-8">
                    <div className="text-center py-16">
                        <div className="text-6xl mb-4">📚</div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                            No Novels Available
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            Check back later for amazing stories!
                        </p>
                        <button
                            onClick={retryConnection}
                            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                        >
                            Refresh
                        </button>
                    </div>
                </div>
            </div>
        );
    }
    
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Featured Section */}
                {featuredNovels.length > 0 && (
                    <section className="mb-12">
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-900 dark:text-gray-100">
                            <Icon name="sparkles" className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                            Featured Novels
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {featuredNovels.slice(0, 3).map(novel => (
                                <div
                                    key={novel.id}
                                    className="relative h-64 rounded-2xl overflow-hidden cursor-pointer hover-lift"
                                    onClick={() => {
                                        setSelectedNovel(novel);
                                        setCurrentView('detail');
                                    }}
                                >
                                    <img 
                                        src={novel.coverImage || `data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iIzY2NkY4OCIvPjx0ZXh0IHRleHQtYW5jaG9yPSJtaWRkbGUiIHg9IjIwMCIgeT0iMTUwIiBzdHlsZT0iZmlsbDojZmZmO2ZvbnQtc2l6ZToyNHB4O2ZvbnQtZmFtaWx5OkFyaWFsIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=`}
                                        alt={novel.title}
                                        className="w-full h-full object-cover"
                                        loading="lazy"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                                        <h3 className="text-xl font-bold mb-2">{novel.title}</h3>
                                        <p className="text-gray-200 text-sm">by {novel.author}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
                
                {/* Latest Updates */}
                {latestChapters.length > 0 && (
                    <section className="mb-12">
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-900 dark:text-gray-100">
                            <Icon name="clock" className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                            Latest Updates
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {latestChapters.map(({ novel, chapter }) => (
                                <div
                                    key={novel.id}
                                    className="bg-white dark:bg-gray-900 rounded-xl shadow-md border border-gray-200 dark:border-gray-800 p-4 hover-lift cursor-pointer animate-fadeIn"
                                    onClick={() => {
                                        setSelectedNovel(novel);
                                        setCurrentView('detail');
                                    }}
                                >
                                    <div className="flex gap-4">
                                        <img 
                                            src={novel.coverImage || `data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjE1MCIgZmlsbD0iIzY2NkY4OCIvPjx0ZXh0IHRleHQtYW5jaG9yPSJtaWRkbGUiIHg9IjUwIiB5PSI3NSIgc3R5bGU9ImZpbGw6I2ZmZjtmb250LXNpemU6MTJweDtmb250LWZhbWlseTpBcmlhbCI+Tm8gSW1hZ2U8L3RleHQ+PC9zdmc+`}
                                            alt={novel.title}
                                            className="w-16 h-20 object-cover rounded-lg"
                                            loading="lazy"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-sm truncate text-gray-900 dark:text-gray-100">
                                                {novel.title}
                                            </h3>
                                            <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                                                {chapter.title}
                                            </p>
                                            <button className="mt-2 text-xs text-indigo-600 dark:text-indigo-400 hover:underline">
                                                Read Chapter →
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
                
                {/* Browse Novels */}
                <section>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
                        <h2 className="text-2xl font-bold flex items-center gap-2 text-gray-900 dark:text-gray-100">
                            <Icon name="library" className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                            Browse Novels
                        </h2>
                        
                        <div className="flex items-center gap-2">
                            <Icon name="filter" className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="text-sm border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-1 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                            >
                                <option value="All">All Status</option>
                                <option value="Ongoing">Ongoing</option>
                                <option value="Completed">Completed</option>
                            </select>
                        </div>
                    </div>
                    
                    {/* Genre Filter */}
                    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-4 mb-6">
                        {['All', ...GENRES].map(genre => (
                            <button
                                key={genre}
                                onClick={() => setSelectedGenre(genre)}
                                className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-all ${
                                    selectedGenre === genre
                                        ? 'bg-indigo-600 text-white shadow-lg'
                                        : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 hover:border-indigo-600 dark:hover:border-indigo-400'
                                }`}
                            >
                                {genre}
                            </button>
                        ))}
                    </div>
                    
                    {/* Novels Grid */}
                    {filteredNovels.length > 0 ? (
                        <>
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                                {filteredNovels.map((novel, index) => {
                                    if (filteredNovels.length === index + 1) {
                                        return (
                                            <div ref={lastNovelElementRef} key={novel.id}>
                                                <NovelCard
                                                    novel={novel}
                                                    onClick={() => {
                                                        setSelectedNovel(novel);
                                                        setCurrentView('detail');
                                                    }}
                                                />
                                            </div>
                                        );
                                    } else {
                                        return (
                                            <NovelCard
                                                key={novel.id}
                                                novel={novel}
                                                onClick={() => {
                                                    setSelectedNovel(novel);
                                                    setCurrentView('detail');
                                                }}
                                            />
                                        );
                                    }
                                })}
                            </div>
                            
                            {/* Loading More */}
                            {loadingMore && (
                                <div className="flex justify-center items-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                                    <span className="ml-3 text-gray-600 dark:text-gray-400">
                                        Loading more novels...
                                    </span>
                                </div>
                            )}
                            
                            {/* End Message */}
                            {!hasMore && novels.length > 0 && (
                                <div className="text-center py-8">
                                    <p className="text-gray-500 dark:text-gray-400">
                                        ✨ You've reached the end!
                                    </p>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-12">
                            <Icon name="book-x" className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                            <p className="text-gray-500 dark:text-gray-400">
                                No novels found. Try adjusting your filters.
                            </p>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
};

window.HomePage = HomePage;
