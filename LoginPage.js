const { useState, useContext } = React;

const LoginPage = ({ setCurrentView }) => {
    const { 
        signIn, 
        signUp, 
        signInWithGoogle, 
        resetPassword,
        error: authError,
        clearError 
    } = useContext(AuthContext);
    
    const [isSignUp, setIsSignUp] = useState(false);
    const [isForgotPassword, setIsForgotPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    
    // Clear errors when switching modes
    useEffect(() => {
        setError('');
        setSuccess('');
        clearError && clearError();
    }, [isSignUp, isForgotPassword]);
    
    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);
        
        try {
            // Forgot Password Mode
            if (isForgotPassword) {
                if (!email) {
                    throw new Error('Please enter your email address');
                }
                await resetPassword(email);
                setSuccess('Password reset email sent! Check your inbox.');
                setTimeout(() => {
                    setIsForgotPassword(false);
                    setSuccess('');
                }, 3000);
                return;
            }
            
            // Sign Up Mode
            if (isSignUp) {
                // Validation
                if (!name || !email || !password || !confirmPassword) {
                    throw new Error('Please fill in all fields');
                }
                if (password.length < 6) {
                    throw new Error('Password must be at least 6 characters');
                }
                if (password !== confirmPassword) {
                    throw new Error('Passwords do not match');
                }
                
                await signUp(email, password, name);
                setSuccess('Account created successfully!');
                setTimeout(() => {
                    setCurrentView('home');
                }, 1000);
            } else {
                // Sign In Mode
                if (!email || !password) {
                    throw new Error('Please enter email and password');
                }
                
                await signIn(email, password);
                setSuccess('Signed in successfully!');
                setTimeout(() => {
                    setCurrentView('home');
                }, 500);
            }
        } catch (error) {
            console.error('Auth error:', error);
            setError(error.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };
    
    // Handle Google Sign In
    const handleGoogleSignIn = async () => {
        setError('');
        setSuccess('');
        setLoading(true);
        
        try {
            await signInWithGoogle();
            setSuccess('Signed in with Google successfully!');
            setTimeout(() => {
                setCurrentView('home');
            }, 500);
        } catch (error) {
            console.error('Google sign in error:', error);
            setError(error.message || 'Failed to sign in with Google');
        } finally {
            setLoading(false);
        }
    };
    
    // Reset form when switching modes
    const switchMode = (mode) => {
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setName('');
        setError('');
        setSuccess('');
        
        if (mode === 'signup') {
            setIsSignUp(true);
            setIsForgotPassword(false);
        } else if (mode === 'signin') {
            setIsSignUp(false);
            setIsForgotPassword(false);
        } else if (mode === 'forgot') {
            setIsForgotPassword(true);
            setIsSignUp(false);
        }
    };
    
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4 transition-colors">
            <div className="w-full max-w-md animate-fadeIn">
                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 p-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div 
                            className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-full mb-4 cursor-pointer"
                            onClick={() => setCurrentView('home')}
                        >
                            <Icon name="book-open" className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                            {isForgotPassword 
                                ? 'Reset Password' 
                                : isSignUp 
                                ? 'Create Account' 
                                : 'Welcome Back'}
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-2">
                            {isForgotPassword
                                ? 'Enter your email to reset password'
                                : isSignUp 
                                ? 'Sign up to start reading amazing novels' 
                                : 'Sign in to continue your reading journey'}
                        </p>
                    </div>
                    
                    {/* Error Message */}
                    {(error || authError) && (
                        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm flex items-center gap-2">
                            <Icon name="alert-circle" className="w-4 h-4" />
                            {error || authError}
                        </div>
                    )}
                    
                    {/* Success Message */}
                    {success && (
                        <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg text-sm flex items-center gap-2">
                            <Icon name="check-circle" className="w-4 h-4" />
                            {success}
                        </div>
                    )}
                    
                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Name Field (Sign Up Only) */}
                        {isSignUp && !isForgotPassword && (
                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                                    Full Name
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required={isSignUp}
                                        className="w-full px-4 py-2 pl-10 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition"
                                        placeholder="John Doe"
                                        disabled={loading}
                                    />
                                    <Icon name="user" className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                </div>
                            </div>
                        )}
                        
                        {/* Email Field */}
                        <div>
                            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                                Email Address
                            </label>
                            <div className="relative">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full px-4 py-2 pl-10 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition"
                                    placeholder="you@example.com"
                                    disabled={loading}
                                />
                                <Icon name="mail" className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                            </div>
                        </div>
                        
                        {/* Password Field */}
                        {!isForgotPassword && (
                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="w-full px-4 py-2 pl-10 pr-10 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition"
                                        placeholder="••••••••"
                                        disabled={loading}
                                    />
                                    <Icon name="lock" className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                    >
                                        <Icon name={showPassword ? "eye-off" : "eye"} className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                        
                        {/* Confirm Password Field (Sign Up Only) */}
                        {isSignUp && !isForgotPassword && (
                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                                    Confirm Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required={isSignUp}
                                        className="w-full px-4 py-2 pl-10 pr-10 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition"
                                        placeholder="••••••••"
                                        disabled={loading}
                                    />
                                    <Icon name="lock" className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                </div>
                            </div>
                        )}
                        
                        {/* Forgot Password Link */}
                        {!isSignUp && !isForgotPassword && (
                            <div className="text-right">
                                <button
                                    type="button"
                                    onClick={() => switchMode('forgot')}
                                    className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
                                >
                                    Forgot Password?
                                </button>
                            </div>
                        )}
                        
                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                    <span>Processing...</span>
                                </>
                            ) : (
                                <>
                                    <Icon name={
                                        isForgotPassword 
                                            ? "mail" 
                                            : isSignUp 
                                            ? "user-plus" 
                                            : "log-in"
                                    } className="w-4 h-4" />
                                    <span>
                                        {isForgotPassword 
                                            ? 'Send Reset Email' 
                                            : isSignUp 
                                            ? 'Create Account' 
                                            : 'Sign In'}
                                    </span>
                                </>
                            )}
                        </button>
                    </form>
                    
                    {/* Google Sign In */}
                    {!isForgotPassword && (
                        <>
                            <div className="relative my-6">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400">
                                        Or continue with
                                    </span>
                                </div>
                            </div>
                            
                            <button
                                onClick={handleGoogleSignIn}
                                disabled={loading}
                                className="w-full py-3 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                </svg>
                                <span>Continue with Google</span>
                            </button>
                        </>
                    )}
                    
                    {/* Switch Mode Links */}
                    <div className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
                        {isForgotPassword ? (
                            <button
                                onClick={() => switchMode('signin')}
                                className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                            >
                                Back to Sign In
                            </button>
                        ) : (
                            <>
                                {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                                <button
                                    onClick={() => switchMode(isSignUp ? 'signin' : 'signup')}
                                    className="ml-1 text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                                >
                                    {isSignUp ? 'Sign In' : 'Sign Up'}
                                </button>
                            </>
                        )}
                    </div>
                    
                    {/* Terms and Privacy */}
                    {isSignUp && (
                        <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-4">
                            By signing up, you agree to our{' '}
                            <button 
                                onClick={() => setCurrentView('terms')}
                                className="text-indigo-600 dark:text-indigo-400 hover:underline"
                            >
                                Terms
                            </button>
                            {' '}and{' '}
                            <button 
                                onClick={() => setCurrentView('privacy')}
                                className="text-indigo-600 dark:text-indigo-400 hover:underline"
                            >
                                Privacy Policy
                            </button>
                        </p>
                    )}
                </div>
                
                {/* Back to Home */}
                <div className="text-center mt-4">
                    <button
                        onClick={() => setCurrentView('home')}
                        className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition"
                    >
                        ← Back to Home
                    </button>
                </div>
            </div>
        </div>
    );
};

window.LoginPage = LoginPage;
