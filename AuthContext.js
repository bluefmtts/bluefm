// AuthContext.js

const { useState, useEffect, useContext, createContext } = React;

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    
    useEffect(() => {
        // auth object is globally available from firebase.js
        const unsubscribe = auth.onAuthStateChanged((user) => {
            setUser(user);
            setIsAdmin(user?.email === 'vikassingh44999@gmail.com');
            setLoading(false);
        });
        
        return () => unsubscribe();
    }, []);
    
    const signOut = () => {
        return auth.signOut();
    };
    
    const value = {
        user,
        loading,
        isAdmin,
        signOut
    };
    
    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
