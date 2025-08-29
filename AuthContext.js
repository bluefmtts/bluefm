// AuthContext.js

const { useState, useEffect, useContext, createContext } = React;

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [error, setError] = useState(null);
    
    // Check admin status
    const checkAdminStatus = (email) => {
        const adminEmails = ['vikassingh44999@gmail.com'];
        return adminEmails.includes(email);
    };
    
    useEffect(() => {
        // auth object is globally available from firebase.js
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (user) {
                setUser(user);
                setIsAdmin(checkAdminStatus(user.email));
                
                // Create/update user document in Firestore
                try {
                    await db.collection('users').doc(user.uid).set({
                        email: user.email,
                        displayName: user.displayName || '',
                        photoURL: user.photoURL || '',
                        lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
                        createdAt: firebase.firestore.FieldValue.serverTimestamp()
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
    
    // Email/Password Sign Up
    const signUp = async (email, password, displayName = '') => {
        try {
            setError(null);
            setLoading(true);
            
            // Create user with email and password
            const result = await auth.createUserWithEmailAndPassword(email, password);
            
            // Update display name if provided
            if (displayName && result.user) {
                await result.user.updateProfile({
                    displayName: displayName
                });
            }
            
            // Create user document in Firestore
            if (result.user) {
                await db.collection('users').doc(result.user.uid).set({
                    email: result.user.email,
                    displayName: displayName || '',
                    photoURL: '',
                    isPremium: false,
                    bookmarks: [],
                    readingHistory: [],
                    readProgress: {},
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    lastLogin: firebase.firestore.FieldValue.serverTimestamp()
                });
            }
            
            return result.user;
        } catch (error) {
            console.error('Sign up error:', error);
            setError(error.message);
            throw error;
        } finally {
            setLoading(false);
        }
    };
    
    // Email/Password Sign In
    const signIn = async (email, password) => {
        try {
            setError(null);
            setLoading(true);
            
            const result = await auth.signInWithEmailAndPassword(email, password);
            
            // Update last login
            if (result.user) {
                await db.collection('users').doc(result.user.uid).update({
                    lastLogin: firebase.firestore.FieldValue.serverTimestamp()
                });
            }
            
            return result.user;
        } catch (error) {
            console.error('Sign in error:', error);
            let errorMessage = 'Failed to sign in';
            
            // Provide user-friendly error messages
            switch (error.code) {
                case 'auth/user-not-found':
                    errorMessage = 'No account found with this email';
                    break;
                case 'auth/wrong-password':
                    errorMessage = 'Incorrect password';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'Invalid email address';
                    break;
                case 'auth/user-disabled':
                    errorMessage = 'This account has been disabled';
                    break;
                case 'auth/too-many-requests':
                    errorMessage = 'Too many failed attempts. Please try again later';
                    break;
                default:
                    errorMessage = error.message;
            }
            
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    };
    
    // Google Sign In
    const signInWithGoogle = async () => {
        try {
            setError(null);
            setLoading(true);
            
            const provider = new firebase.auth.GoogleAuthProvider();
            provider.setCustomParameters({
                prompt: 'select_account'
            });
            
            const result = await auth.signInWithPopup(provider);
            
            // Create/update user document
            if (result.user) {
                await db.collection('users').doc(result.user.uid).set({
                    email: result.user.email,
                    displayName: result.user.displayName || '',
                    photoURL: result.user.photoURL || '',
                    isPremium: false,
                    lastLogin: firebase.firestore.FieldValue.serverTimestamp()
                }, { merge: true });
            }
            
            return result.user;
        } catch (error) {
            console.error('Google sign in error:', error);
            let errorMessage = 'Failed to sign in with Google';
            
            switch (error.code) {
                case 'auth/popup-closed-by-user':
                    errorMessage = 'Sign in cancelled';
                    break;
                case 'auth/popup-blocked':
                    errorMessage = 'Popup blocked. Please allow popups for this site';
                    break;
                case 'auth/cancelled-popup-request':
                    errorMessage = 'Only one popup request is allowed at a time';
                    break;
                default:
                    errorMessage = error.message;
            }
            
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    };
    
    // Password Reset
    const resetPassword = async (email) => {
        try {
            setError(null);
            await auth.sendPasswordResetEmail(email);
            return true;
        } catch (error) {
            console.error('Password reset error:', error);
            let errorMessage = 'Failed to send reset email';
            
            switch (error.code) {
                case 'auth/user-not-found':
                    errorMessage = 'No account found with this email';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'Invalid email address';
                    break;
                default:
                    errorMessage = error.message;
            }
            
            setError(errorMessage);
            throw new Error(errorMessage);
        }
    };
    
    // Update Profile
    const updateProfile = async (updates) => {
        try {
            setError(null);
            const currentUser = auth.currentUser;
            
            if (!currentUser) {
                throw new Error('No user logged in');
            }
            
            // Update Firebase Auth profile
            if (updates.displayName !== undefined || updates.photoURL !== undefined) {
                await currentUser.updateProfile({
                    displayName: updates.displayName || currentUser.displayName,
                    photoURL: updates.photoURL || currentUser.photoURL
                });
            }
            
            // Update Firestore document
            await db.collection('users').doc(currentUser.uid).update({
                ...updates,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            // Refresh user state
            setUser({...currentUser});
            
            return true;
        } catch (error) {
            console.error('Update profile error:', error);
            setError(error.message);
            throw error;
        }
    };
    
    // Update Email
    const updateEmail = async (newEmail, password) => {
        try {
            setError(null);
            const currentUser = auth.currentUser;
            
            if (!currentUser) {
                throw new Error('No user logged in');
            }
            
            // Re-authenticate before updating email
            const credential = firebase.auth.EmailAuthProvider.credential(
                currentUser.email,
                password
            );
            await currentUser.reauthenticateWithCredential(credential);
            
            // Update email
            await currentUser.updateEmail(newEmail);
            
            // Update Firestore
            await db.collection('users').doc(currentUser.uid).update({
                email: newEmail,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            return true;
        } catch (error) {
            console.error('Update email error:', error);
            let errorMessage = 'Failed to update email';
            
            switch (error.code) {
                case 'auth/wrong-password':
                    errorMessage = 'Incorrect password';
                    break;
                case 'auth/email-already-in-use':
                    errorMessage = 'Email already in use';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'Invalid email address';
                    break;
                default:
                    errorMessage = error.message;
            }
            
            setError(errorMessage);
            throw new Error(errorMessage);
        }
    };
    
    // Update Password
    const updatePassword = async (currentPassword, newPassword) => {
        try {
            setError(null);
            const currentUser = auth.currentUser;
            
            if (!currentUser) {
                throw new Error('No user logged in');
            }
            
            // Re-authenticate before updating password
            const credential = firebase.auth.EmailAuthProvider.credential(
                currentUser.email,
                currentPassword
            );
            await currentUser.reauthenticateWithCredential(credential);
            
            // Update password
            await currentUser.updatePassword(newPassword);
            
            return true;
        } catch (error) {
            console.error('Update password error:', error);
            let errorMessage = 'Failed to update password';
            
            switch (error.code) {
                case 'auth/wrong-password':
                    errorMessage = 'Current password is incorrect';
                    break;
                case 'auth/weak-password':
                    errorMessage = 'New password is too weak (minimum 6 characters)';
                    break;
                default:
                    errorMessage = error.message;
            }
            
            setError(errorMessage);
            throw new Error(errorMessage);
        }
    };
    
    // Delete Account
    const deleteAccount = async (password) => {
        try {
            setError(null);
            const currentUser = auth.currentUser;
            
            if (!currentUser) {
                throw new Error('No user logged in');
            }
            
            // Re-authenticate before deleting
            const credential = firebase.auth.EmailAuthProvider.credential(
                currentUser.email,
                password
            );
            await currentUser.reauthenticateWithCredential(credential);
            
            // Delete user data from Firestore
            await db.collection('users').doc(currentUser.uid).delete();
            
            // Delete auth account
            await currentUser.delete();
            
            return true;
        } catch (error) {
            console.error('Delete account error:', error);
            setError(error.message);
            throw error;
        }
    };
    
    // Sign Out
    const signOut = async () => {
        try {
            setError(null);
            await auth.signOut();
            setUser(null);
            setIsAdmin(false);
            
            // Clear local storage
            localStorage.removeItem('bookmarks');
            localStorage.removeItem('readingHistory');
            localStorage.removeItem('readProgress');
            
            return true;
        } catch (error) {
            console.error('Sign out error:', error);
            setError(error.message);
            throw error;
        }
    };
    
    // Clear error
    const clearError = () => {
        setError(null);
    };
    
    const value = {
        user,
        loading,
        isAdmin,
        error,
        signUp,
        signIn,
        signInWithGoogle,
        signOut,
        resetPassword,
        updateProfile,
        updateEmail,
        updatePassword,
        deleteAccount,
        clearError
    };
    
    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

// Export for global use
window.AuthProvider = AuthProvider;
window.useAuth = () => useContext(AuthContext);
