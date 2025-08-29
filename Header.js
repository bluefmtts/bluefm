const { useState, useContext, useEffect, useRef, useCallback, useMemo } = React;

const Header = ({ currentView, setCurrentView }) => {
    const { isDark, toggleTheme } = useContext(ThemeContext);
    const { user, isAdmin, signOut } = useContext(AuthContext);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [searchHistory, setSearchHistory] = useState(() => {
        const saved = localStorage.getItem('searchHistory');
        return saved ? JSON.parse(saved) : [];
    });
    
    const searchRef = useRef(null);
    const searchTimeoutRef = useRef(null);
    const resultsRef = useRef(null);
    
    // Debounced search function
    const debouncedSearch = useCallback(
        (query) => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
            
            searchTimeoutRef.current = setTimeout(async () => {
                if (query.trim().length > 1) {
                    setSearchLoading(true);
                    try {
                        // Use Firebase search from firebase.js
                        const results = await FirebaseUtils.novels.search(query.trim());
                        setSearchResults(results);
                        setShowSearchResults(true);
                    } catch (error) {
                        console.error('Search error:', error);
                        setSearchResults([]);
                    } finally {
                        setSearchLoading(false);
                    }
                } else {
                    setSearchResults([]);
                    setShowSearchResults(false);
                }
            }, 300); // 300ms debounce
        },
        []
    );
    
    // Handle search input change
    const handleSearchChange = useCallback((e) => {
        const value = e.target.value;
        setSearchQuery(value);
        debouncedSearch(value);
    }, [debouncedSearch]);
    
    // Handle search result click
    const handleSearchResultClick = useCallback((novel) => {
        setSearchQuery('');
        setShowSearchResults(false);
        setMobileMenuOpen(false);
        
        // Add to search history
        const newHistory = [novel.title, ...searchHistory.filter(item => item !== novel.title)].slice(0, 5);
        setSearchHistory(newHistory);
        localStorage.setItem('searchHistory', JSON.stringify(newHistory));
        
        // Navigate to novel
        // Assuming you have setSelectedNovel function available globally
        if (window.setSelectedNovel) {
            window.setSelectedNovel(novel);
            setCurrentView('detail');
        }
    }, [searchHistory, setCurrentView]);
    
    // Clear search
    const clearSearch = useCallback(() => {
        setSearchQuery('');
        setSearchResults([]);
        setShowSearchResults(false);
    }, []);
    
    // Handle keyboard navigation
    const handleSearchKeyDown = useCallback((e) => {
        if (e.key === 'Escape') {
            clearSearch();
            searchRef.current?.blur();
        }
        // You can add more keyboard navigation here (arrow keys, enter)
    }, [clearSearch]);
    
    // Click outside to close search results
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (resultsRef.current && !resultsRef.current.contains(event.target) &&
                searchRef.current && !searchRef.current.contains(event.target)) {
                setShowSearchResults(false);
            }
        };
        
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    
    // Clean up timeout on unmount
    useEffect(() => {
        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, []);
    
    // Optimized navigation handlers
    const navigationHandlers = useMemo(() => ({
        home: () => setCurrentView('home'),
        library: () => setCurrentView('library'),
        admin: () => setCurrentView('admin'),
        profile: () => setCurrentView('profile'),
        login: () => setCurrentView('login'),
    }), [setCurrentView]);
    
    // Search Results Component
    const SearchResults = () => (
        <div 
            ref={resultsRef}
            className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 max-h-80 overflow-y-auto"
        >
            {searchLoading ? (
                <div className="p-4 text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Searching...</p>
                </div>
            ) : searchResults.length > 0 ? (
                <div className="py-2">
                    {searchResults.map((novel) => (
                        <button
                            key={novel.id}
                            onClick={() => handleSearchResultClick(novel)}
                            className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-3"
                        >
                            <img
                                src={novel.coverImage || `https://via.placeholder.com/40x60`}
                                alt={novel.title}
                                className="w-10 h-12 object-cover rounded"
                                loading="lazy"
                            />
                            <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                                    {novel.title}
                                </h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                    by {novel.author}
                                </p>
                            </div>
                            <span className="text-xs text-indigo-600 dark:text-indigo-400">
                                {novel.genre}
                            </span>
                        </button>
                    ))}
                </div>
            ) : searchQuery.trim().length > 1 ? (
                <div className="p-4 text-center">
                    <Icon name="search-x" className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">No novels found</p>
                </div>
            ) : searchHistory.length > 0 ? (
                <div className="py-2">
                    <div className="px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Recent Searches
                    </div>
                    {searchHistory.map((item, index) => (
                        <button
                            key={index}
                            onClick={() => {
                                setSearchQuery(item);
                                debouncedSearch(item);
                            }}
                            className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
                        >
                            <Icon name="clock" className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">{item}</span>
                        </button>
                    ))}
                </div>
            ) : null}
        </div>
    );
    
    return (
        <nav className="sticky top-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 transition-colors">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <div 
                        className="flex items-center cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={navigationHandlers.home}
                    >
                        <img 
                            src="logo.jpg" 
                            alt="BlueFM Novel" 
                            className="w-10 h-10 mr-2 object-contain"
                            loading="lazy"
                        />
                        <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                            BlueFM Novel
                        </span>
                    </div>
                    
                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-4">
                        {/* Enhanced Search */}
                        <div className="relative">
                            <input
                                ref={searchRef}
                                type="text"
                                placeholder="Search novels, authors..."
                                value={searchQuery}
                                onChange={handleSearchChange}
                                onKeyDown={handleSearchKeyDown}
                                onFocus={() => setShowSearchResults(true)}
                                className="w-64 px-4 py-2 pl-10 pr-10 bg-gray-100 dark:bg-gray-800 rounded-full text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all focus:w-72"
                            />
                            <Icon name="search" className="absolute left-3 top-2.5 w-4 h-4 text-gray-500 dark:text-gray-400" />
                            
                            {searchQuery && (
                                <button
                                    onClick={clearSearch}
                                    className="absolute right-3 top-2.5 w-4 h-4 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                                >
                                    <Icon name="x" className="w-4 h-4" />
                                </button>
                            )}
                            
                            {showSearchResults && (
                                <SearchResults />
                            )}
                        </div>
                        
                        {/* Navigation Buttons */}
                        <button
                            onClick={navigationHandlers.home}
                            className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                                currentView === 'home' 
                                    ? 'bg-indigo-600 text-white shadow-lg' 
                                    : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                            }`}
                        >
                            <Icon name="home" className="w-5 h-5" />
                            <span className="hidden lg:inline">Home</span>
                        </button>
                        
                        <button
                            onClick={navigationHandlers.library}
                            className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                                currentView === 'library' 
                                    ? 'bg-indigo-600 text-white shadow-lg' 
                                    : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                            }`}
                        >
                            <Icon name="book-marked" className="w-5 h-5" />
                            <span className="hidden lg:inline">Library</span>
                        </button>
                        
                        {isAdmin && (
                            <button
                                onClick={navigationHandlers.admin}
                                className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                                    currentView === 'admin' 
                                        ? 'bg-purple-600 text-white shadow-lg' 
                                        : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                                }`}
                            >
                                <Icon name="settings" className="w-5 h-5" />
                                <span className="hidden lg:inline">Admin</span>
                            </button>
                        )}
                        
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-all"
                            aria-label="Toggle theme"
                        >
                            <Icon name={isDark ? "sun" : "moon"} className="w-5 h-5" />
                        </button>
                        
                        {user ? (
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={navigationHandlers.profile}
                                    className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                                        currentView === 'profile' 
                                            ? 'bg-indigo-600 text-white shadow-lg' 
                                            : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                                    }`}
                                >
                                    <Icon name="user" className="w-5 h-5" />
                                    <span className="hidden lg:inline">Profile</span>
                                </button>
                                <button
                                    onClick={signOut}
                                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all flex items-center gap-2"
                                >
                                    <Icon name="log-out" className="w-5 h-5" />
                                    <span className="hidden lg:inline">Sign Out</span>
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={navigationHandlers.login}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all shadow-lg"
                            >
                                Sign In
                            </button>
                        )}
                    </div>
                    
                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center space-x-2">
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                        >
                            <Icon name={isDark ? "sun" : "moon"} className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                        >
                            <Icon name={mobileMenuOpen ? "x" : "menu"} className="w-6 h-6" />
                        </button>
                    </div>
                </div>
                
                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden py-4 border-t border-gray-200 dark:border-gray-700 animate-slideUp">
                        <div className="space-y-2">
                            {/* Mobile Search */}
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search novels..."
                                    value={searchQuery}
                                    onChange={handleSearchChange}
                                    onKeyDown={handleSearchKeyDown}
                                    className="w-full px-4 py-2 pl-10 pr-10 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                                <Icon name="search" className="absolute left-3 top-2.5 w-4 h-4 text-gray-500 dark:text-gray-400" />
                                {searchQuery && (
                                    <button
                                        onClick={clearSearch}
                                        className="absolute right-3 top-2.5 w-4 h-4 text-gray-500 dark:text-gray-400"
                                    >
                                        <Icon name="x" className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                            
                            {/* Mobile Search Results */}
                            {showSearchResults && searchResults.length > 0 && (
                                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-2 space-y-1">
                                    {searchResults.slice(0, 3).map((novel) => (
                                        <button
                                            key={novel.id}
                                            onClick={() => handleSearchResultClick(novel)}
                                            className="w-full px-3 py-2 text-left hover:bg-white dark:hover:bg-gray-700 rounded transition-colors flex items-center gap-3"
                                        >
                                            <img
                                                src={novel.coverImage || `https://via.placeholder.com/30x40`}
                                                alt={novel.title}
                                                className="w-8 h-10 object-cover rounded"
                                                loading="lazy"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">
                                                    {novel.title}
                                                </h4>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                                    {novel.author}
                                                </p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                            
                            {/* Mobile Navigation Items */}
                            <button
                                onClick={() => {
                                    navigationHandlers.home();
                                    setMobileMenuOpen(false);
                                }}
                                className={`w-full px-4 py-3 rounded-lg text-left transition-all flex items-center gap-3 ${
                                    currentView === 'home' 
                                        ? 'bg-indigo-600 text-white' 
                                        : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                                }`}
                            >
                                <Icon name="home" className="w-5 h-5" />
                                Home
                            </button>
                            
                            <button
                                onClick={() => {
                                    navigationHandlers.library();
                                    setMobileMenuOpen(false);
                                }}
                                className={`w-full px-4 py-3 rounded-lg text-left transition-all flex items-center gap-3 ${
                                    currentView === 'library' 
                                        ? 'bg-indigo-600 text-white' 
                                        : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                                }`}
                            >
                                <Icon name="book-marked" className="w-5 h-5" />
                                Library
                            </button>
                            
                            {isAdmin && (
                                <button
                                    onClick={() => {
                                        navigationHandlers.admin();
                                        setMobileMenuOpen(false);
                                    }}
                                    className={`w-full px-4 py-3 rounded-lg text-left transition-all flex items-center gap-3 ${
                                        currentView === 'admin' 
                                            ? 'bg-purple-600 text-white' 
                                            : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                                    }`}
                                >
                                    <Icon name="settings" className="w-5 h-5" />
                                    Admin Panel
                                </button>
                            )}
                            
                            {user ? (
                                <>
                                    <button
                                        onClick={() => {
                                            navigationHandlers.profile();
                                            setMobileMenuOpen(false);
                                        }}
                                        className={`w-full px-4 py-3 rounded-lg text-left transition-all flex items-center gap-3 ${
                                            currentView === 'profile' 
                                                ? 'bg-indigo-600 text-white' 
                                                : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                                        }`}
                                    >
                                        <Icon name="user" className="w-5 h-5" />
                                        Profile
                                    </button>
                                    <button
                                        onClick={() => {
                                            signOut();
                                            setMobileMenuOpen(false);
                                        }}
                                        className="w-full px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 text-left flex items-center gap-3 transition-all"
                                    >
                                        <Icon name="log-out" className="w-5 h-5" />
                                        Sign Out
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={() => {
                                        navigationHandlers.login();
                                        setMobileMenuOpen(false);
                                    }}
                                    className="w-full px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-left flex items-center gap-3 transition-all"
                                >
                                    <Icon name="user-plus" className="w-5 h-5" />
                                    Sign In
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};
