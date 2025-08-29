const { useContext } = React;

const ProfilePage = ({ setCurrentView }) => {
    const { user } = useContext(AuthContext);
    const { readingHistory, bookmarks, novels } = useContext(DataContext);
    
    if (!user) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center transition-colors">
                <div className="text-center">
                    <Icon name="user-x" className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                        Please sign in to view your profile
                    </p>
                    <button
                        onClick={() => setCurrentView('login')}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                        Sign In
                    </button>
                </div>
            </div>
        );
    }
    
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Profile Header */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 p-6 mb-6 animate-fadeIn">
                    <div className="flex items-center gap-4">
                        {user.photoURL ? (
                            <img 
                                src={user.photoURL} 
                                alt="Profile" 
                                className="w-20 h-20 rounded-full"
                            />
                        ) : (
                            <div className="w-20 h-20 bg-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                                {user.email?.[0]?.toUpperCase() || 'U'}
                            </div>
                        )}
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                {user.displayName || 'Reader'}
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                {user.email}
                            </p>
                        </div>
                    </div>
                </div>
                
                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md border border-gray-200 dark:border-gray-800 p-4 text-center">
                        <Icon name="bookmark" className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{bookmarks.length}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Bookmarked</p>
                    </div>
                    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md border border-gray-200 dark:border-gray-800 p-4 text-center">
                        <Icon name="clock" className="w-8 h-8 text-green-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{readingHistory.length}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Read</p>
                    </div>
                    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md border border-gray-200 dark:border-gray-800 p-4 text-center">
                        <Icon name="trending-up" className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                            {novels.filter(n => n.status === 'Ongoing' && bookmarks.includes(n.id)).length}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Ongoing</p>
                    </div>
                    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md border border-gray-200 dark:border-gray-800 p-4 text-center">
                        <Icon name="award" className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                            {novels.filter(n => n.status === 'Completed' && bookmarks.includes(n.id)).length}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
                    </div>
                </div>
                
                {/* Reading History */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 p-6 animate-slideUp">
                    <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">Recent Activity</h2>
                    {readingHistory.length > 0 ? (
                        <div className="space-y-3">
                            {readingHistory.slice(0, 10).map((item, index) => (
                                <div 
                                    key={index} 
                                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                                >
                                    <div>
                                        <p className="font-semibold text-gray-900 dark:text-gray-100">
                                            {item.novelTitle}
                                        </p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {item.chapterTitle}
                                        </p>
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {new Date(item.timestamp).toLocaleDateString()}
                                    </p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                            No reading history yet
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};
