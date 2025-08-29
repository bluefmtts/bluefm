const { useMemo } = React;

// Base Skeleton Component
const SkeletonElement = ({ 
    width = 'w-full', 
    height = 'h-4', 
    className = '', 
    rounded = 'rounded' 
}) => (
    <div 
        className={`bg-gray-200 dark:bg-gray-700 animate-pulse ${width} ${height} ${rounded} ${className}`}
        style={{ 
            animationDelay: `${Math.random() * 0.5}s`,
            animationDuration: '1.5s'
        }}
    />
);

// Novel Card Skeleton
const NovelCardSkeleton = ({ index = 0 }) => (
    <div 
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-md border border-gray-200 dark:border-gray-800 overflow-hidden"
        style={{ animationDelay: `${index * 0.1}s` }}
    >
        {/* Image Skeleton */}
        <SkeletonElement 
            height="h-48 sm:h-56" 
            rounded="rounded-none"
            className="animate-pulse"
        />
        
        {/* Content Skeleton */}
        <div className="p-4 space-y-3">
            {/* Title */}
            <SkeletonElement width="w-3/4" height="h-4" />
            
            {/* Author */}
            <SkeletonElement width="w-1/2" height="h-3" />
            
            {/* Stats Row */}
            <div className="flex justify-between items-center">
                <SkeletonElement width="w-16" height="h-3" />
                <SkeletonElement width="w-12" height="h-3" />
            </div>
            
            {/* Button */}
            <SkeletonElement height="h-8" rounded="rounded-xl" />
        </div>
    </div>
);

// List Item Skeleton (for latest updates, etc.)
const ListItemSkeleton = ({ index = 0 }) => (
    <div 
        className="bg-white dark:bg-gray-900 rounded-xl shadow-md border border-gray-200 dark:border-gray-800 p-4"
        style={{ animationDelay: `${index * 0.05}s` }}
    >
        <div className="flex gap-4">
            {/* Small Cover */}
            <SkeletonElement width="w-16" height="h-20" rounded="rounded-lg" />
            
            {/* Content */}
            <div className="flex-1 space-y-2">
                <SkeletonElement width="w-3/4" height="h-4" />
                <SkeletonElement width="w-1/2" height="h-3" />
                <SkeletonElement width="w-20" height="h-3" />
            </div>
        </div>
    </div>
);

// Chapter List Skeleton
const ChapterListSkeleton = ({ count = 5 }) => (
    <div className="space-y-2">
        {[...Array(count)].map((_, i) => (
            <div 
                key={i}
                className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4"
                style={{ animationDelay: `${i * 0.05}s` }}
            >
                <div className="flex justify-between items-center">
                    <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3">
                            <SkeletonElement width="w-12" height="h-3" />
                            <SkeletonElement width="w-48" height="h-4" />
                        </div>
                        <SkeletonElement width="w-24" height="h-3" />
                    </div>
                    <SkeletonElement width="w-5" height="h-5" rounded="rounded-full" />
                </div>
            </div>
        ))}
    </div>
);

// Novel Detail Header Skeleton
const NovelDetailSkeleton = () => (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 p-6">
        <div className="flex flex-col sm:flex-row gap-6">
            {/* Cover Image */}
            <SkeletonElement 
                width="w-full sm:w-48" 
                height="h-72" 
                rounded="rounded-xl"
            />
            
            {/* Novel Info */}
            <div className="flex-1 space-y-4">
                {/* Title */}
                <SkeletonElement width="w-3/4" height="h-8" />
                
                {/* Author */}
                <SkeletonElement width="w-1/2" height="h-6" />
                
                {/* Tags */}
                <div className="flex gap-2">
                    <SkeletonElement width="w-16" height="h-6" rounded="rounded-full" />
                    <SkeletonElement width="w-20" height="h-6" rounded="rounded-full" />
                    <SkeletonElement width="w-12" height="h-6" rounded="rounded-full" />
                </div>
                
                {/* Summary */}
                <div className="space-y-2">
                    <SkeletonElement width="w-full" height="h-4" />
                    <SkeletonElement width="w-full" height="h-4" />
                    <SkeletonElement width="w-2/3" height="h-4" />
                </div>
                
                {/* Buttons */}
                <div className="flex gap-3">
                    <SkeletonElement width="w-32" height="h-10" rounded="rounded-lg" />
                    <SkeletonElement width="w-28" height="h-10" rounded="rounded-lg" />
                </div>
            </div>
        </div>
    </div>
);

// Featured Section Skeleton
const FeaturedSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => (
            <div 
                key={i}
                className="relative h-64 rounded-2xl overflow-hidden"
                style={{ animationDelay: `${i * 0.1}s` }}
            >
                <SkeletonElement 
                    height="h-full" 
                    rounded="rounded-2xl"
                    className="animate-pulse"
                />
                
                {/* Gradient Overlay Simulation */}
                <div className="absolute bottom-0 left-0 right-0 p-6">
                    <SkeletonElement width="w-3/4" height="h-6" className="mb-2" />
                    <SkeletonElement width="w-1/2" height="h-4" />
                </div>
            </div>
        ))}
    </div>
);

// Main LoadingSkeleton Component with variants
const LoadingSkeleton = ({ 
    variant = 'cards', 
    count = 10,
    className = ''
}) => {
    const skeletonContent = useMemo(() => {
        switch (variant) {
            case 'cards':
                return (
                    <div className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 ${className}`}>
                        {[...Array(count)].map((_, i) => (
                            <NovelCardSkeleton key={i} index={i} />
                        ))}
                    </div>
                );
                
            case 'list':
                return (
                    <div className={`space-y-4 ${className}`}>
                        {[...Array(Math.min(count, 6))].map((_, i) => (
                            <ListItemSkeleton key={i} index={i} />
                        ))}
                    </div>
                );
                
            case 'chapters':
                return (
                    <div className={className}>
                        <ChapterListSkeleton count={count} />
                    </div>
                );
                
            case 'detail':
                return (
                    <div className={`space-y-6 ${className}`}>
                        <NovelDetailSkeleton />
                    </div>
                );
                
            case 'featured':
                return (
                    <div className={className}>
                        <FeaturedSkeleton />
                    </div>
                );
                
            case 'compact':
                return (
                    <div className={`grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3 ${className}`}>
                        {[...Array(count)].map((_, i) => (
                            <div key={i} className="space-y-2">
                                <SkeletonElement height="h-32" rounded="rounded-lg" />
                                <SkeletonElement width="w-full" height="h-3" />
                            </div>
                        ))}
                    </div>
                );
                
            default:
                return (
                    <div className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 ${className}`}>
                        {[...Array(count)].map((_, i) => (
                            <NovelCardSkeleton key={i} index={i} />
                        ))}
                    </div>
                );
        }
    }, [variant, count, className]);
    
    return (
        <div className="animate-fadeIn">
            {skeletonContent}
        </div>
    );
};

// Export different variants for easy use
const SkeletonVariants = {
    Cards: (props) => <LoadingSkeleton variant="cards" {...props} />,
    List: (props) => <LoadingSkeleton variant="list" {...props} />,
    Chapters: (props) => <LoadingSkeleton variant="chapters" {...props} />,
    Detail: (props) => <LoadingSkeleton variant="detail" {...props} />,
    Featured: (props) => <LoadingSkeleton variant="featured" {...props} />,
    Compact: (props) => <LoadingSkeleton variant="compact" {...props} />
};

// Make it globally available
window.LoadingSkeleton = LoadingSkeleton;
window.SkeletonVariants = SkeletonVariants;
