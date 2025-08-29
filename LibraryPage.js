const { useContext } = React;

const LibraryPage = ({ setCurrentView, setSelectedNovel }) => {
    const { novels, bookmarks } = useContext(DataContext);
    const bookmarkedNovels = novels.filter(n => bookmarks.includes(n.id));
    
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
            <div className="max-w-7xl mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-8 flex items-center gap-2 text-gray-900 dark:text-gray-100">
                    <Icon name="book-marked" className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                    My Library
                </h1>
                
                {bookmarkedNovels.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {bookmarkedNovels.map(novel => (
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
                        <Icon name="bookmark-x" className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-500 dark:text-gray-400">
                            No bookmarked novels yet. Start adding your favorites!
                        </p>
                        <button
                            onClick={() => setCurrentView('home')}
                            className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                        >
                            Browse Novels
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
