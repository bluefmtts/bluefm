const { useContext } = React;

const NovelCard = ({ novel, onClick }) => {
    const { bookmarks, toggleBookmark } = useContext(DataContext);
    const { user } = useContext(AuthContext);
    const isBookmarked = bookmarks.includes(novel.id);
    
    // Use ONLY saved image, with a fallback placeholder
    const getImageSrc = () => {
        if (novel.coverImage) {
            return novel.coverImage;
        }
        if (novel.coverUrl) {
            return novel.coverUrl;
        }
        // Default placeholder image if no image is saved
        return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHRleHQtYW5jaG9yPSJtaWRkbGUiIHg9IjEwMCIgeT0iMTUwIiBzdHlsZT0iZmlsbDojYWFhO2ZvbnQtd2VpZ2h0OmJvbGQ7Zm9udC1zaXplOjE5cHg7Zm9udC1mYW1pbHk6QXJpYWwsSGVsdmV0aWNhLHNhbnMtc2VyaWY7ZG9taW5hbnQtYmFzZWxpbmU6Y2VudHJhbCI+Tm8gSW1hZ2U8L3RleHQ+PC9zdmc+';
    };
    
    return (
        <div className="hover-lift bg-white dark:bg-gray-900 rounded-2xl shadow-md border border-gray-200 dark:border-gray-800 overflow-hidden animate-fadeIn">
            <div className="relative">
                <img 
                    src={getImageSrc()} 
                    alt={novel.title}
                    className="w-full h-48 sm:h-56 object-cover"
                    loading="lazy"
                    onError={(e) => {
                        // If image fails to load, show placeholder
                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHRleHQtYW5jaG9yPSJtaWRkbGUiIHg9IjEwMCIgeT0iMTUwIiBzdHlsZT0iZmlsbDojYWFhO2ZvbnQtd2VpZ2h0OmJvbGQ7Zm9udC1zaXplOjE5cHg7Zm9udC1mYW1pbHk6QXJpYWwsSGVsdmV0aWNhLHNhbnMtc2VyaWY7ZG9taW5hbnQtYmFzZWxpbmU6Y2VudHJhbCI+Tm8gSW1hZ2U8L3RleHQ+PC9zdmc+';
                    }}
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
                {novel.totalChapters > 0 && (
                    <div className="absolute bottom-2 left-2">
                        <span className="px-2 py-1 bg-black/70 text-white text-xs rounded-full">
                            {novel.totalChapters} Chapters
                        </span>
                    </div>
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
                        <span className="text-gray-700 dark:text-gray-300">{novel.rating?.toFixed(1) || '0.0'}</span>
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

window.NovelCard = NovelCard;
