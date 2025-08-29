const { useState, useEffect, useContext, createContext } = React;

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [error, setError] = useState(null);
    
    // Admin emails - make sure ADMIN_EMAILS exists
    const ADMIN_EMAILS = window.ADMIN_EMAILS || ['vikassingh44999@gmail.com'];
    
    // Check admin status
    const checkAdminStatus = (email) => {
        if (!email || !ADMIN_EMAILS) return false;
        return ADMIN_EMAILS.includes(email);
    };
    
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (user) {
                setUser(user);
                setIsAdmin(checkAdminStatus(user.email));
                
                // Create/update user document
                try {
                    await db.collection('users').doc(user.uid).set({
                        email: user.email,
                        displayName: user.displayName || '',
                        photoURL: user.photoURL || '',
                        lastLogin: firebase.firestore.FieldValue.serverTimestamp()
                    }, { merge: true });
                } catch (error) {
                    console.error('Error updating user document:', error);
                }
            } else {
                setUser(null);
                setIsAdmin(false);
            }
            setLoading(false);
        });
        
        return () => unsubscribe();
    }, []);
    
    // Rest of your auth functions...
    const signIn = async (email, password) => {
        try {
            setError(null);
            const result = await auth.signInWithEmailAndPassword(email, password);
            return result.user;
        } catch (error) {
            console.error('Sign in error:', error);
            setError(error.message);
            throw error;
        }
    };
    
    const signUp = async (email, password, displayName = '') => {
        try {
            setError(null);
            const result = await auth.createUserWithEmailAndPassword(email, password);
            
            if (displayName && result.user) {
                await result.user.updateProfile({ displayName });
            }
            
            return result.user;
        } catch (error) {
            console.error('Sign up error:', error);
            setError(error.message);
            throw error;
        }
    };
    
    const signInWithGoogle = async () => {
        try {
            setError(null);
            const provider = new firebase.auth.GoogleAuthProvider();
            const result = await auth.signInWithPopup(provider);
            return result.user;
        } catch (error) {
            console.error('Google sign in error:', error);
            setError(error.message);
            throw error;
        }
    };
    
    const signOut = async () => {
        try {
            await auth.signOut();
            setUser(null);
            setIsAdmin(false);
        } catch (error) {
            console.error('Sign out error:', error);
            throw error;
        }
    };
    
    const resetPassword = async (email) => {
        try {
            await auth.sendPasswordResetEmail(email);
            return true;
        } catch (error) {
            console.error('Password reset error:', error);
            throw error;
        }
    };
    
    const clearError = () => {
        setError(null);
    };
    
    const value = {
        user,
        loading,
        isAdmin,
        error,
        signIn,
        signUp,
        signInWithGoogle,
        signOut,
        resetPassword,
        clearError
    };
    
    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

window.AuthProvider = AuthProvider;
window.useAuth = () => useContext(AuthContext);
