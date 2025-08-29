const { useContext } = React;

const MembershipGate = ({ children, onUpgrade }) => {
    const { hasMembership, loading, purchaseMembership } = useContext(MembershipContext);
    const { user } = useContext(AuthContext);
    
    // TEMPORARY: Disable membership requirement
    const MEMBERSHIP_DISABLED = true; // Set to false when you want to enable again
    
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
                <LoadingSpinner />
            </div>
        );
    }
    
    // If membership is disabled, allow everyone to read
    if (MEMBERSHIP_DISABLED) {
        return children;
    }
    
    if (!user) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4">
                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 p-8 text-center max-w-md">
                    <Icon name="user-x" className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                        Login Required
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Please login to access premium content
                    </p>
                    <button
                        onClick={() => onUpgrade('login')}
                        className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                    >
                        Login Now
                    </button>
                </div>
            </div>
        );
    }
    
    if (!hasMembership) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4">
                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 p-8 text-center max-w-md animate-fadeIn">
                    <div className="w-20 h-20 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Icon name="crown" className="w-10 h-10 text-white" />
                    </div>
                    
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                        Premium Membership
                    </h2>
                    
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Premium membership is currently under review. Please check back in a few days!
                    </p>
                    
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 mb-6">
                        <div className="flex items-center gap-3">
                            <Icon name="clock" className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                            <div className="text-left">
                                <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100">
                                    Temporary Maintenance
                                </p>
                                <p className="text-xs text-yellow-800 dark:text-yellow-200">
                                    We're updating our payment system for better security
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    <button
                        onClick={() => onUpgrade('home')}
                        className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all font-medium"
                    >
                        Back to Home
                    </button>
                    
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
                        For urgent queries, contact: support@bluefmnovel.com
                    </p>
                </div>
            </div>
        );
    }
    
    return children;
};
