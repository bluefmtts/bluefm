const LoadingSkeleton = () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {[...Array(10)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl shadow-md border border-gray-200 dark:border-gray-800 overflow-hidden">
                <div className="skeleton h-48 sm:h-56" />
                <div className="p-4">
                    <div className="skeleton h-4 w-3/4 mb-2 rounded" />
                    <div className="skeleton h-3 w-1/2 mb-3 rounded" />
                    <div className="skeleton h-8 w-full rounded" />
                </div>
            </div>
        ))}
    </div>
);
