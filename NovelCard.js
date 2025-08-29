const { useContext, useState, useRef, useEffect } = React;

const NovelCard = ({ novel, onClick }) => {
    const { bookmarks, toggleBookmark } = useContext(DataContext);
    const { user } = useContext(AuthContext);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const cardRef = useRef(null);
    const isBookmarked = bookmarks.includes(novel.id);
    
    // Intersection Observer for lazy loading
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.unobserve(entry.target);
                }
            },
            {
                rootMargin: '100px', // Start loading 100px before visible
                threshold: 0.01
            }
        );
        
        if (cardRef.current) {
            observer.observe(cardRef.current);
        }
        
        return () => {
            if (cardRef.current) {
                observer.unobserve(cardRef.current);
            }
        };
    }, []);
    
    // Default placeholder image
    const placeholderImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2U1ZTdlYiIvPjx0ZXh0IHRleHQtYW5jaG9yPSJtaWRkbGUiIHg9IjEwMCIgeT0iMTUwIiBzdHlsZT0iZmlsbDojOWNhM2FmO2ZvbnQtc2l6ZToxNnB4O2ZvbnQtZmFtaWx5OkFyaWFsIj5Mb2FkaW5nLi4uPC90ZXh0Pjwvc3ZnPg==';
    
    const getImageSrc = () => {
        if (imageError || !novel.coverImage) {
            return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iIzY2NkY4OCIvPjx0ZXh0IHRleHQtYW5jaG9yPSJtaWRkbGUiIHg9IjEwMCIgeT0iMTUwIiBzdHlsZT0iZmlsbDojZmZmO2ZvbnQtc2l6ZToxOHB4O2ZvbnQtZmFtaWx5OkFyaWFsIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';
        }
        return novel.coverImage || novel.coverUrl;
    };
    
    return (
        <div ref={cardRef} className="hover-lift bg-white dark:bg-gray-900 rounded-2xl shadow-md border border-gray-200 dark:border-gray-800 overflow-hidden animate-fadeIn">
            <div className="relative">
                {/* Placeholder while loading */}
                {!imageLoaded && (
                    <img 
                        src={placeholderImage}
                        alt=""
                        className="w-full h-48 sm:h-56 object-cover"
                    />
                )}
                
                {/* Actual image - only load when visible */}
                {isVisible && (
                    <img 
                        src={getImageSrc()} 
                        alt={novel.title}
                        className={`w-full h-48 sm:h-56 object-cover transition-opacity duration-300 ${
                            imageLoaded ? 'opacity-100' : 'opacity-0 absolute inset-0'
                        }`}
                        loading="lazy"
                        onLoad={() => setImageLoaded(true)}
                        onError={() => {
                            setImageError(true);
                            setImageLoaded(true);
                        }}
                    />
                )}
                
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
