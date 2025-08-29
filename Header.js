const { useState, useContext } = React;

const Header = ({ currentView, setCurrentView }) => {
    const { isDark, toggleTheme } = useContext(ThemeContext);
    const { user, isAdmin, signOut } = useContext(AuthContext);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    
    return (
        <nav className="sticky top-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 transition-colors">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo - Image Version */}
                    <div 
                        className="flex items-center cursor-pointer"
                        onClick={() => setCurrentView('home')}
                    >
                        <img 
                            src="logo.jpg" 
                            alt="BlueFM Novel" 
                            className="w-10 h-10 mr-2 object-contain"
                        />
                        <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                            BlueFM Novel
                        </span>
                    </div>
                    
                    {/* Baaki sab code same hai... */}
                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-4">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search novels..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-64 px-4 py-2 pl-10 bg-gray-100 dark:bg-gray-800 rounded-full text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                            />
                            <Icon name="search" className="absolute left-3 top-2.5 w-4 h-4 text-gray-500 dark:text-gray-400" />
                        </div>
                        
                        <button
                            onClick={() => setCurrentView('home')}
                            className={`px-4 py-2 rounded-lg transition-all ${
                                currentView === 'home' 
                                    ? 'bg-indigo-600 text-white shadow-lg' 
                                    : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                            }`}
                        >
                            <Icon name="home" className="w-5 h-5" />
                        </button>
                        
                        <button
                            onClick={() => setCurrentView('library')}
                            className={`px-4 py-2 rounded-lg transition-all ${
                                currentView === 'library' 
                                    ? 'bg-indigo-600 text-white shadow-lg' 
                                    : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                            }`}
                        >
                            <Icon name="book-marked" className="w-5 h-5" />
                        </button>
                        
                        {isAdmin && (
                            <button
                                onClick={() => setCurrentView('admin')}
                                className={`px-4 py-2 rounded-lg transition-all ${
                                    currentView === 'admin' 
                                        ? 'bg-purple-600 text-white shadow-lg' 
                                        : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                                }`}
                            >
                                <Icon name="settings" className="w-5 h-5" />
                            </button>
                        )}
                        
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-all"
                        >
                            <Icon name={isDark ? "sun" : "moon"} className="w-5 h-5" />
                        </button>
                        
                        {user ? (
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => setCurrentView('profile')}
                                    className={`px-4 py-2 rounded-lg transition-all ${
                                        currentView === 'profile' 
                                            ? 'bg-indigo-600 text-white shadow-lg' 
                                            : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                                    }`}
                                >
                                    <Icon name="user" className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={signOut}
                                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
                                >
                                    <Icon name="log-out" className="w-5 h-5" />
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => setCurrentView('login')}
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
                            <input
                                type="text"
                                placeholder="Search novels..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                            
                            <button
                                onClick={() => {
                                    setCurrentView('home');
                                    setMobileMenuOpen(false);
                                }}
                                className={`w-full px-4 py-2 rounded-lg text-left transition-all ${
                                    currentView === 'home' 
                                        ? 'bg-indigo-600 text-white' 
                                        : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                                }`}
                            >
                                Home
                            </button>
                            
                            <button
                                onClick={() => {
                                    setCurrentView('library');
                                    setMobileMenuOpen(false);
                                }}
                                className={`w-full px-4 py-2 rounded-lg text-left transition-all ${
                                    currentView === 'library' 
                                        ? 'bg-indigo-600 text-white' 
                                        : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                                }`}
                            >
                                Library
                            </button>
                            
                            {isAdmin && (
                                <button
                                    onClick={() => {
                                        setCurrentView('admin');
                                        setMobileMenuOpen(false);
                                    }}
                                    className={`w-full px-4 py-2 rounded-lg text-left transition-all ${
                                        currentView === 'admin' 
                                            ? 'bg-purple-600 text-white' 
                                            : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                                    }`}
                                >
                                    Admin Panel
                                </button>
                            )}
                            
                            {user ? (
                                <>
                                    <button
                                        onClick={() => {
                                            setCurrentView('profile');
                                            setMobileMenuOpen(false);
                                        }}
                                        className={`w-full px-4 py-2 rounded-lg text-left transition-all ${
                                            currentView === 'profile' 
                                                ? 'bg-indigo-600 text-white' 
                                                : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                                        }`}
                                    >
                                        Profile
                                    </button>
                                    <button
                                        onClick={() => {
                                            signOut();
                                            setMobileMenuOpen(false);
                                        }}
                                        className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-left"
                                    >
                                        Sign Out
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={() => {
                                        setCurrentView('login');
                                        setMobileMenuOpen(false);
                                    }}
                                    className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-left"
                                >
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



