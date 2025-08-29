const { useContext } = React;

const NovelCard = ({ novel, onClick }) => {
    const { bookmarks, toggleBookmark } = useContext(DataContext);
    const { user } = useContext(AuthContext);
    const isBookmarked = bookmarks.includes(novel.id);
    
    return (
        <div className="hover-lift bg-white dark:bg-gray-900 rounded-2xl shadow-md border border-gray-200 dark:border-gray-800 overflow-hidden animate-fadeIn">
            <div className="relative">
                <img 
                    src={novel.coverUrl || `https://picsum.photos/200/300?random=${novel.id}`} 
                    alt={novel.title}
                    className="w-full h-48 sm:h-56 object-cover"
                    loading="lazy"
                />
                <div className="absolute top-2 right-2 flex gap-2">
                    <span className={`px-2 py-1 text-xs rounded-full backdrop-blur-md ${
                        novel.status === 'Completed' 
                            ? 'bg-green-500/90 text-white' 
                            : 'bg-yellow-500/90 text-white'
                    }`}>
                        {novel.status}
                    </span>
                </div>
                {user && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            toggleBookmark(novel.id);
                        }}
                        className="absolute top-2 left-2 p-2 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-full shadow-lg hover:scale-110 transition-transform"
                    >
                        <Icon 
                            name={isBookmarked ? "bookmark-check" : "bookmark"} 
                            className={`w-4 h-4 ${isBookmarked ? 'text-indigo-600' : 'text-gray-600 dark:text-gray-400'}`}
                        />
                    </button>
                )}
            </div>
            <div className="p-4">
                <h3 className="font-bold text-base mb-1 line-clamp-1 text-gray-900 dark:text-gray-100">
                    {novel.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {novel.author}
                </p>
                <div className="flex items-center justify-between text-sm">
                    <span className="text-indigo-600 dark:text-indigo-400">
                        {novel.genre}
                    </span>
                    <div className="flex items-center gap-1">
                        <Icon name="star" className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="text-gray-700 dark:text-gray-300">{novel.rating?.toFixed(1) || '4.0'}</span>
                    </div>
                </div>
                <button
                    onClick={onClick}
                    className="w-full mt-3 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all text-sm font-medium"
                >
                    Read Now
                </button>
            </div>
        </div>
    );
};
