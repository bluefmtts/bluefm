const { useState, useEffect, createContext, useContext } = React;

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            setUser(user);
            if (user) {
                // Check if user is admin
                const adminDoc = await db.collection('admins').doc(user.uid).get();
                setIsAdmin(adminDoc.exists || ADMIN_EMAILS.includes(user.email));
                
                // Create/update user profile
                await db.collection('users').doc(user.uid).set({
                    email: user.email,
                    displayName: user.displayName,
                    photoURL: user.photoURL,
                    lastLogin: firebase.firestore.FieldValue.serverTimestamp()
                }, { merge: true });
            } else {
                setIsAdmin(false);
            }
            setLoading(false);
        });
        return unsubscribe;
    }, []);
    
    const signInWithGoogle = async () => {
        try {
            const provider = new firebase.auth.GoogleAuthProvider();
            const result = await auth.signInWithPopup(provider);
            return result.user;
        } catch (error) {
            console.error("Error signing in with Google:", error);
            throw error;
        }
    };
    
    const signInWithEmail = async (email, password) => {
        try {
            const result = await auth.signInWithEmailAndPassword(email, password);
            return result.user;
        } catch (error) {
            console.error("Error signing in:", error);
            throw error;
        }
    };
    
    const signUpWithEmail = async (email, password, displayName) => {
        try {
            const result = await auth.createUserWithEmailAndPassword(email, password);
            if (displayName) {
                await result.user.updateProfile({ displayName });
            }
            return result.user;
        } catch (error) {
            console.error("Error signing up:", error);
            throw error;
        }
    };
    
    const signOut = async () => {
        try {
            await auth.signOut();
        } catch (error) {
            console.error("Error signing out:", error);
            throw error;
        }
    };
    
    return (
        <AuthContext.Provider value={{ 
            user, 
            isAdmin,
            loading, 
            signInWithGoogle, 
            signInWithEmail, 
            signUpWithEmail, 
            signOut 
        }}>
            {children}
        </AuthContext.Provider>
    );
};
