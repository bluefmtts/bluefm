const { useState, useContext, useMemo, useRef, useCallback, useEffect } = React;

const HomePage = ({ setCurrentView, setSelectedNovel }) => {
    const { 
        novels, 
        loading, 
        loadingMore, 
        hasMore, 
        loadMoreNovels 
    } = useContext(DataContext);
    
    const [selectedGenre, setSelectedGenre] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');
    const observer = useRef();
    
    const GENRES = ['Romance', 'Fantasy', 'Thriller', 'Sci-Fi', 'Mystery', 'Adventure', 'Drama', 'Action'];
    
    // Infinite scroll - last element reference
    const lastNovelElementRef = useCallback(node => {
        if (loadingMore) return;
        if (observer.current) observer.current.disconnect();
        
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore && !loading) {
                console.log('Loading more novels...');
                loadMoreNovels();
            }
        }, {
            rootMargin: '200px', // Start loading 200px before reaching bottom
            threshold: 0.1
        });
        
        if (node) observer.current.observe(node);
    }, [loadingMore, hasMore, loading, loadMoreNovels]);
    
    // Featured novels - only from loaded novels
    const featuredNovels = useMemo(() => {
        return novels.filter(n => n.featured).slice(0, 3);
    }, [novels]);
    
    // Filtered novels based on genre and status
    const filteredNovels = useMemo(() => {
        return novels.filter(novel => {
            const matchesGenre = selectedGenre === 'All' || novel.genre === selectedGenre;
            const matchesStatus = statusFilter === 'All' || novel.status === statusFilter;
            return matchesGenre && matchesStatus;
        });
    }, [novels, selectedGenre, statusFilter]);
    
    // Latest chapters - only from loaded novels, no chapters needed
    const latestUpdates = useMemo(() => {
        return novels
            .filter(n => n.totalChapters > 0)
            .slice(0, 6)
            .map(novel => ({
                novel,
                latestChapter: `Chapter ${novel.totalChapters}` // Just show chapter number
            }));
    }, [novels]);
    
    // Reset filters when needed
    const resetFilters = () => {
        setSelectedGenre('All');
        setStatusFilter('All');
    };
    
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
            <div className="max-w-7xl mx-auto px-4 py-8">
                
                {/* Initial Loading State */}
                {loading && novels.length === 0 ? (
                    <div className="space-y-8">
                        {/* Loading Featured Section */}
                        <section>
                            <div className="h-8 w-48 bg-gray-200 dark:bg-gray-800 rounded animate-pulse mb-6"></div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="h-64 bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse"></div>
                                ))}
                            </div>
                        </section>
                        
                        {/* Loading Novels Grid */}
                        <section>
                            <div className="h-8 w-48 bg-gray-200 dark:bg-gray-800 rounded animate-pulse mb-6"></div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                                {[1, 2, 3, 4, 5, 6].map(i => (
                                    <LoadingSkeleton key={i} />
                                ))}
                            </div>
                        </section>
                    </div>
                ) : (
                    <>
                        {/* Featured Section - Only if featured novels exist */}
                        {featuredNovels.length > 0 && (
                            <section className="mb-12 animate-fadeIn">
                                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-900 dark:text-gray-100">
                                    <Icon name="sparkles" className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                                    Featured Novels
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {featuredNovels.map(novel => (
                                        <div
                                            key={novel.id}
                                            className="relative h-64 rounded-2xl overflow-hidden cursor-pointer hover-lift group"
                                            onClick={() => {
                                                setSelectedNovel(novel);
                                                setCurrentView('detail');
                                            }}
                                        >
                                            <img 
                                                src={novel.coverImage || `https://picsum.photos/400/300?random=${novel.id}`}
                                                alt={novel.title}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
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
                        
                        {/* Latest Updates - Simplified without loading chapters */}
                        {latestUpdates.length > 0 && (
                            <section className="mb-12 animate-fadeIn">
                                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-900 dark:text-gray-100">
                                    <Icon name="clock" className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                                    Latest Updates
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {latestUpdates.map(({ novel, latestChapter }) => (
                                        <div
                                            key={novel.id}
                                            className="bg-white dark:bg-gray-900 rounded-xl shadow-md border border-gray-200 dark:border-gray-800 p-4 hover-lift cursor-pointer"
                                            onClick={() => {
                                                setSelectedNovel(novel);
                                                setCurrentView('detail');
                                            }}
                                        >
                                            <div className="flex gap-4">
                                                <img 
                                                    src={novel.coverImage || `https://picsum.photos/100/150?random=${novel.id}`}
                                                    alt={novel.title}
                                                    className="w-16 h-20 object-cover rounded-lg"
                                                    loading="lazy"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-semibold text-sm truncate text-gray-900 dark:text-gray-100">
                                                        {novel.title}
                                                    </h3>
                                                    <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                                                        {latestChapter}
                                                    </p>
                                                    <button className="mt-2 text-xs text-indigo-600 dark:text-indigo-400 hover:underline">
                                                        Read Now →
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
                            
                            {/* Novels Grid with Infinite Scroll */}
                            {filteredNovels.length > 0 ? (
                                <>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                                        {filteredNovels.map((novel, index) => {
                                            // Attach ref to last element for infinite scroll
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
                                    
                                    {/* Loading More Indicator */}
                                    {loadingMore && (
                                        <div className="flex justify-center items-center py-8 animate-fadeIn">
                                            <div className="flex items-center gap-3">
                                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                                                <span className="text-gray-600 dark:text-gray-400">
                                                    Loading more novels...
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {/* No More Content */}
                                    {!hasMore && novels.length > 0 && (
                                        <div className="text-center py-8 animate-fadeIn">
                                            <div className="inline-flex items-center gap-2 text-gray-500 dark:text-gray-400">
                                                <Icon name="check-circle" className="w-5 h-5" />
                                                <p>You've reached the end! Check back later for more novels.</p>
                                            </div>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="text-center py-12">
                                    <Icon name="book-x" className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                                        No novels found with current filters.
                                    </p>
                                    <button 
                                        onClick={resetFilters}
                                        className="text-indigo-600 dark:text-indigo-400 hover:underline"
                                    >
                                        Reset Filters
                                    </button>
                                </div>
                            )}
                        </section>
                    </>
                )}
            </div>
        </div>
    );
};
