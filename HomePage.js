const { useState, useContext, useMemo } = React;

const HomePage = ({ setCurrentView, setSelectedNovel }) => {
    const { novels, loading } = useContext(DataContext);
    const [selectedGenre, setSelectedGenre] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');
    
    const GENRES = ['Romance', 'Fantasy', 'Thriller', 'Sci-Fi', 'Mystery', 'Adventure', 'Drama', 'Action'];
    
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
            .filter(n => n.chapters && n.chapters.length > 0)
            .slice(0, 6)
            .map(novel => ({
                novel,
                chapter: novel.chapters[novel.chapters.length - 1]
            }));
    }, [novels]);
    
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
                                        src={novel.coverUrl || `https://picsum.photos/400/300?random=${novel.id}`}
                                        alt={novel.title}
                                        className="w-full h-full object-cover"
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
                                    key={`${novel.id}-${chapter.id}`}
                                    className="bg-white dark:bg-gray-900 rounded-xl shadow-md border border-gray-200 dark:border-gray-800 p-4 hover-lift cursor-pointer animate-fadeIn"
                                    onClick={() => {
                                        setSelectedNovel(novel);
                                        setCurrentView('detail');
                                    }}
                                >
                                    <div className="flex gap-4">
                                        <img 
                                            src={novel.coverUrl || `https://picsum.photos/100/150?random=${novel.id}`}
                                            alt={novel.title}
                                            className="w-16 h-20 object-cover rounded-lg"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-sm truncate text-gray-900 dark:text-gray-100">{novel.title}</h3>
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
                    {loading ? (
                        <LoadingSkeleton />
                    ) : filteredNovels.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                            {filteredNovels.map(novel => (
                                <NovelCard
                                    key={novel.id}
                                    novel={novel}
                                    onClick={() => {
                                        setSelectedNovel(novel);
                                        setCurrentView('detail');
                                    }}
                                />
                            ))}
                        </div>
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
