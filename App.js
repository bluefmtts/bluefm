const { useState, useEffect, Suspense, lazy, Component } = React;

// Error Boundary Component
class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }
    
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }
    
    componentDidCatch(error, errorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);
    }
    
    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
                    <div className="text-center p-8">
                        <div className="text-6xl mb-4">😵</div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                            Oops! Something went wrong
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            Don't worry, we've saved your reading progress.
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                        >
                            Refresh Page
                        </button>
                    </div>
                </div>
            );
        }
        
        return this.props.children;
    }
}

// Loading Component
const PageLoader = () => (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
    </div>
);

// Lazy load heavy components
const AdminPanel = lazy(() => new Promise(resolve => {
    setTimeout(() => resolve({ default: window.AdminPanel }), 100);
}));

const App = () => {
    const [currentView, setCurrentView] = useState('home');
    const [selectedNovel, setSelectedNovel] = useState(null);
    const [selectedChapter, setSelectedChapter] = useState(null);
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [appReady, setAppReady] = useState(false);
    
    // Check online status
    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);
        
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        
        // App ready after a short delay
        setTimeout(() => setAppReady(true), 500);
        
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);
    
    // Handle back button
    useEffect(() => {
        const handlePopState = () => {
            const views = ['home', 'detail', 'reader'];
            const currentIndex = views.indexOf(currentView);
            if (currentIndex > 0) {
                setCurrentView(views[currentIndex - 1]);
            }
        };
        
        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, [currentView]);
    
    // Save current view to localStorage
    useEffect(() => {
        if (currentView !== 'reader') {
            localStorage.setItem('lastView', currentView);
        }
    }, [currentView]);
    
    // Offline banner
    const OfflineBanner = () => (
        <div className="bg-yellow-500 text-white px-4 py-2 text-center text-sm">
            <span>📡 You're offline. Some features may not work properly.</span>
        </div>
    );
    
    if (!appReady) {
        return <PageLoader />;
    }
    
    return (
        <ErrorBoundary>
            <ThemeProvider>
                <AuthProvider>
                    <DataProvider>
                        <MembershipProvider>
                            <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors flex flex-col">
                                {!isOnline && <OfflineBanner />}
                                
                                <Header currentView={currentView} setCurrentView={setCurrentView} />
                                
                                <main className="flex-1">
                                    <ErrorBoundary>
                                        {/* Home View */}
                                        {currentView === 'home' && (
                                            <HomePage 
                                                setCurrentView={setCurrentView}
                                                setSelectedNovel={setSelectedNovel}
                                            />
                                        )}
                                        
                                        {/* Novel Detail View */}
                                        {currentView === 'detail' && selectedNovel && (
                                            <NovelDetailPage 
                                                novel={selectedNovel}
                                                setCurrentView={setCurrentView}
                                                setSelectedChapter={setSelectedChapter}
                                            />
                                        )}
                                        
                                        {/* Reader View */}
                                        {currentView === 'reader' && selectedChapter && (
                                            <MembershipGate onUpgrade={() => setCurrentView('profile')}>
                                                <ReaderPage 
                                                    chapterData={selectedChapter}
                                                    setCurrentView={setCurrentView}
                                                />
                                            </MembershipGate>
                                        )}
                                        
                                        {/* Library View */}
                                        {currentView === 'library' && (
                                            <LibraryPage 
                                                setCurrentView={setCurrentView}
                                                setSelectedNovel={setSelectedNovel}
                                            />
                                        )}
                                        
                                        {/* Profile View */}
                                        {currentView === 'profile' && (
                                            <ProfilePage setCurrentView={setCurrentView} />
                                        )}
                                        
                                        {/* Login View */}
                                        {currentView === 'login' && (
                                            <LoginPage setCurrentView={setCurrentView} />
                                        )}
                                        
                                        {/* Admin Panel - Lazy Loaded */}
                                        {currentView === 'admin' && (
                                            <Suspense fallback={<PageLoader />}>
                                                <AdminPanel setCurrentView={setCurrentView} />
                                            </Suspense>
                                        )}
                                        
                                        {/* Static Pages */}
                                        {currentView === 'terms' && (
                                            <TermsPage setCurrentView={setCurrentView} />
                                        )}
                                        
                                        {currentView === 'privacy' && (
                                            <PrivacyPage setCurrentView={setCurrentView} />
                                        )}
                                        
                                        {currentView === 'refund' && (
                                            <RefundPage setCurrentView={setCurrentView} />
                                        )}
                                        
                                        {currentView === 'contact' && (
                                            <ContactPage setCurrentView={setCurrentView} />
                                        )}
                                        
                                        {/* 404 Fallback */}
                                        {!['home', 'detail', 'reader', 'library', 'profile', 'login', 'admin', 'terms', 'privacy', 'refund', 'contact'].includes(currentView) && (
                                            <div className="min-h-screen flex items-center justify-center">
                                                <div className="text-center">
                                                    <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">404</h1>
                                                    <p className="text-gray-600 dark:text-gray-400 mb-4">Page not found</p>
                                                    <button
                                                        onClick={() => setCurrentView('home')}
                                                        className="text-indigo-600 dark:text-indigo-400 hover:underline"
                                                    >
                                                        Go to Home
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </ErrorBoundary>
                                </main>
                                
                                {currentView !== 'reader' && (
                                    <Footer setCurrentView={setCurrentView} />
                                )}
                            </div>
                        </MembershipProvider>
                    </DataProvider>
                </AuthProvider>
            </ThemeProvider>
        </ErrorBoundary>
    );
};

// Prevent multiple renders with better check
const initApp = () => {
    const rootElement = document.getElementById('root');
    
    if (!rootElement) {
        console.error('Root element not found!');
        return;
    }
    
    // Clear any existing content (for hot reload)
    if (rootElement._reactRootContainer) {
        console.log('React root already exists, updating...');
    }
    
    try {
        ReactDOM.render(<App />, rootElement);
        console.log('📚 BlueFM Novel App initialized successfully!');
    } catch (error) {
        console.error('Failed to initialize app:', error);
        rootElement.innerHTML = `
            <div style="text-align: center; padding: 50px; font-family: Arial;">
                <h1>😵 App failed to load</h1>
                <p>Please refresh the page</p>
                <button onclick="location.reload()" style="padding: 10px 20px; margin-top: 20px; cursor: pointer;">
                    Refresh
                </button>
            </div>
        `;
    }
};

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

// Global error handler
window.addEventListener('unhandledrejection', event => {
    console.error('Unhandled promise rejection:', event.reason);
    event.preventDefault();
});
