const { useState } = React;

const App = () => {
    const [currentView, setCurrentView] = useState('home');
    const [selectedNovel, setSelectedNovel] = useState(null);
    const [selectedChapter, setSelectedChapter] = useState(null);
    
    return (
        <ThemeProvider>
            <AuthProvider>
                <DataProvider>
                    <MembershipProvider>
                        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors flex flex-col">
                            <Header currentView={currentView} setCurrentView={setCurrentView} />
                            
                            <main className="flex-1">
                                {currentView === 'home' && (
                                    <HomePage 
                                        setCurrentView={setCurrentView}
                                        setSelectedNovel={setSelectedNovel}
                                    />
                                )}
                                
                                {currentView === 'detail' && selectedNovel && (
                                    <NovelDetailPage 
                                        novel={selectedNovel}
                                        setCurrentView={setCurrentView}
                                        setSelectedChapter={setSelectedChapter}
                                    />
                                )}
                                
                                {currentView === 'reader' && selectedChapter && (
                                    <MembershipGate onUpgrade={setCurrentView}>
                                        <ReaderPage 
                                            chapterData={selectedChapter}
                                            setCurrentView={setCurrentView}
                                        />
                                    </MembershipGate>
                                )}
                                
                                {currentView === 'library' && (
                                    <LibraryPage 
                                        setCurrentView={setCurrentView}
                                        setSelectedNovel={setSelectedNovel}
                                    />
                                )}
                                
                                {currentView === 'profile' && (
                                    <ProfilePage setCurrentView={setCurrentView} />
                                )}
                                
                                {currentView === 'login' && (
                                    <LoginPage setCurrentView={setCurrentView} />
                                )}
                                
                                {currentView === 'admin' && (
                                    <AdminPanel setCurrentView={setCurrentView} />
                                )}
                                
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
                            </main>
                            
                            {currentView !== 'reader' && (
                                <Footer setCurrentView={setCurrentView} />
                            )}
                        </div>
                    </MembershipProvider>
                </DataProvider>
            </AuthProvider>
        </ThemeProvider>
    );
};

// Prevent multiple renders
const rootElement = document.getElementById('root');
if (rootElement && !rootElement.hasChildNodes()) {
    ReactDOM.render(<App />, rootElement);
} else {
    console.warn('Root already has content, skipping render');
}
