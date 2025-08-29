const Footer = ({ setCurrentView }) => {
    return (
        <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 mt-auto">
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div>
                        <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-4">BlueFM Novel</h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                            Your premium destination for quality novels and stories. Unlimited reading for just ₹9/year.
                        </p>
                    </div>
                    
                    <div>
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Legal</h4>
                        <div className="space-y-2">
                            <button 
                                onClick={() => setCurrentView('terms')} 
                                className="block text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                            >
                                Terms & Conditions
                            </button>
                            <button 
                                onClick={() => setCurrentView('privacy')} 
                                className="block text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                            >
                                Privacy Policy
                            </button>
                            <button 
                                onClick={() => setCurrentView('refund')} 
                                className="block text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                            >
                                Refund Policy
                            </button>
                        </div>
                    </div>
                    
                    <div>
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Support</h4>
                        <div className="space-y-2">
                            <button 
                                onClick={() => setCurrentView('contact')} 
                                className="block text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                            >
                                Contact Us
                            </button>
                            <a 
                                href="mailto:support@bluefmnovel.com" 
                                className="block text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                            >
                                Email Support
                            </a>
                            <a 
                                href="mailto:billing@bluefmnovel.com" 
                                className="block text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                            >
                                Billing Help
                            </a>
                        </div>
                    </div>
                    
                    <div>
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Premium</h4>
                        <div className="space-y-2">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                ₹9/year membership
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Unlimited novels
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Ad-free reading
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Early access
                            </p>
                        </div>
                    </div>
                </div>
                
                <div className="border-t border-gray-200 dark:border-gray-700 mt-8 pt-6 text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        © 2024 BlueFM Novel. All rights reserved. | Powered by Razorpay
                    </p>
                </div>
            </div>
        </footer>
    );
};
