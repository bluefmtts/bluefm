const { useContext, useState, useRef, useEffect, useCallback } = React;

const NovelCard = ({ novel, onClick }) => {
    const { bookmarks, toggleBookmark } = useContext(DataContext);
    const { user } = useContext(AuthContext);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const cardRef = useRef(null);
    const imageRef = useRef(null);
    
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
                rootMargin: '50px', // Start loading 50px before visible
                threshold: 0.1
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
    
    // Handle image load
    const handleImageLoad = useCallback(() => {
        setImageLoaded(true);
    }, []);
    
    // Handle image error
    const handleImageError = useCallback(() => {
        setImageError(true);
        setImageLoaded(true);
    }, []);
    
    // Get optimized image URL
    const getImageUrl = () => {
        if (imageError) {
            return `https://via.placeholder.com/200x300/6366f1/ffffff?text=${encodeURIComponent(novel.title.substring(0, 10))}`;
        }
        
        // Use coverImage from DataContext or fallback
        return novel.coverImage || 
               novel.coverUrl || 
               `https://picsum.photos/200/300?random=${novel.id}`;
    };
    
    // Optimized click handler
    const handleCardClick = useCallback((e) => {
        e.preventDefault();
        onClick();
    }, [onClick]);
    
    // Optimized bookmark handler
    const handleBookmarkClick = useCallback((e) => {
        e.stopPropagation();
        e.preventDefault();
        toggleBookmark(novel.id);
    }, [novel.id, toggleBookmark]);
    
    return (
        <div 
            ref={cardRef}
            className="hover-lift bg-white dark:bg-gray-900 rounded-2xl shadow-md border border-gray-200 dark:border-gray-800 overflow-hidden animate-fadeIn cursor-pointer"
            onClick={handleCardClick}
        >
            {/* Image Container */}
            <div className="relative bg-gray-100 dark:bg-gray-800">
                {/* Image Skeleton */}
                {!imageLoaded && (
                    <div className="w-full h-48 sm:h-56 bg-gray-200 dark:bg-gray-700 animate-pulse flex items-center justify-center">
                        <Icon name="image" className="w-8 h-8 text-gray-400 dark:text-gray-600" />
                    </div>
                )}
                
                {/* Actual Image - Only load when visible */}
                {isVisible && (
                    <img 
                        ref={imageRef}
                        src={getImageUrl()}
                        alt={novel.title}
                        className={`w-full h-48 sm:h-56 object-cover transition-opacity duration-300 ${
                            imageLoaded ? 'opacity-100' : 'opacity-0'
                        }`}
                        loading="lazy"
                        onLoad={handleImageLoad}
                        onError={handleImageError}
                        decoding="async"
                    />
                )}
                
                {/* Overlays - Only show when image is loaded */}
                {imageLoaded && (
                    <>
                        {/* Status Badge */}
                        <div className="absolute top-2 right-2">
                            <span className={`px-2 py-1 text-xs rounded-full backdrop-blur-md font-medium ${
                                novel.status === 'Completed' 
                                    ? 'bg-green-500/90 text-white' 
                                    : 'bg-yellow-500/90 text-white'
                            }`}>
                                {novel.status || 'Ongoing'}
                            </span>
                        </div>
                        
                        {/* Bookmark Button */}
                        {user && (
                            <button
                                onClick={handleBookmarkClick}
                                className="absolute top-2 left-2 p-2 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-full shadow-lg hover:scale-110 transition-transform active:scale-95"
                                aria-label={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
                            >
                                <Icon 
                                    name={isBookmarked ? "bookmark-check" : "bookmark"} 
                                    className={`w-4 h-4 transition-colors ${
                                        isBookmarked 
                                            ? 'text-indigo-600' 
                                            : 'text-gray-600 dark:text-gray-400'
                                    }`}
                                />
                            </button>
                        )}
                        
                        {/* Premium Badge */}
                        {novel.isPremium && (
                            <div className="absolute bottom-2 right-2">
                                <span className="px-2 py-1 bg-yellow-500/90 text-white text-xs rounded-full backdrop-blur-md font-medium">
                                    Premium
                                </span>
                            </div>
                        )}
                    </>
                )}
            </div>
            
            {/* Content */}
            <div className="p-4">
                <h3 className="font-bold text-base mb-1 line-clamp-1 text-gray-900 dark:text-gray-100">
                    {novel.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-1">
                    by {novel.author}
                </p>
                
                {/* Stats Row */}
                <div className="flex items-center justify-between text-sm mb-3">
                    <span className="text-indigo-600 dark:text-indigo-400 font-medium">
                        {novel.genre}
                    </span>
                    <div className="flex items-center gap-1">
                        <Icon name="star" className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="text-gray-700 dark:text-gray-300 font-medium">
                            {novel.rating ? novel.rating.toFixed(1) : '0.0'}
                        </span>
                    </div>
                </div>
                
                {/* Additional Info */}
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-3">
                    <span className="flex items-center gap-1">
                        <Icon name="book-open" className="w-3 h-3" />
                        {novel.totalChapters || 0} ch
                    </span>
                    <span className="flex items-center gap-1">
                        <Icon name="eye" className="w-3 h-3" />
                        {novel.views ? novel.views.toLocaleString() : '0'}
                    </span>
                </div>
                
                {/* Read Button */}
                <button
                    onClick={handleCardClick}
                    className="w-full py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 active:bg-indigo-800 transition-all text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    aria-label={`Read ${novel.title}`}
                >
                    Read Now
                </button>
            </div>
        </div>
    );
};

// Memoize for better performance
const MemoizedNovelCard = React.memo(NovelCard, (prevProps, nextProps) => {
    // Only re-render if novel data changes
    return (
        prevProps.novel.id === nextProps.novel.id &&
        prevProps.novel.title === nextProps.novel.title &&
        prevProps.novel.coverImage === nextProps.novel.coverImage &&
        prevProps.novel.rating === nextProps.novel.rating &&
        prevProps.novel.views === nextProps.novel.views
    );
});

// Export memoized version
window.NovelCard = MemoizedNovelCard;
