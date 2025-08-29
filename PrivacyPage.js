const PrivacyPage = ({ setCurrentView }) => {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Back Button */}
                <button
                    onClick={() => setCurrentView('home')}
                    className="mb-6 flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                    <Icon name="arrow-left" className="w-5 h-5" />
                    Back to Home
                </button>

                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 p-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                        Privacy Policy
                    </h1>
                    
                    <div className="prose dark:prose-invert max-w-none">
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            <strong>Last updated:</strong> {new Date().toLocaleDateString()}
                        </p>

                        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mt-8 mb-4">
                            1. Information We Collect
                        </h2>
                        <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mt-6 mb-3">
                            Personal Information:
                        </h3>
                        <ul className="text-gray-700 dark:text-gray-300 mb-4 list-disc pl-6">
                            <li>Email address (for account creation)</li>
                            <li>Name (optional, for personalization)</li>
                            <li>Profile picture (if provided via Google login)</li>
                            <li>Payment information (processed securely by Razorpay)</li>
                        </ul>

                        <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mt-6 mb-3">
                            Usage Information:
                        </h3>
                        <ul className="text-gray-700 dark:text-gray-300 mb-4 list-disc pl-6">
                            <li>Reading history and progress</li>
                            <li>Bookmarked novels</li>
                            <li>Device information and browser type</li>
                            <li>IP address and location data</li>
                        </ul>

                        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mt-8 mb-4">
                            2. How We Use Your Information
                        </h2>
                        <ul className="text-gray-700 dark:text-gray-300 mb-4 list-disc pl-6">
                            <li>Provide and maintain our service</li>
                            <li>Process payments and manage subscriptions</li>
                            <li>Personalize your reading experience</li>
                            <li>Send important service updates</li>
                            <li>Improve our platform and content</li>
                            <li>Prevent fraud and ensure security</li>
                        </ul>

                        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mt-8 mb-4">
                            3. Information Sharing
                        </h2>
                        <p className="text-gray-700 dark:text-gray-300 mb-4">
                            We do not sell, trade, or rent your personal information to third parties. We may share information only in these circumstances:
                        </p>
                        <ul className="text-gray-700 dark:text-gray-300 mb-4 list-disc pl-6">
                            <li>With your explicit consent</li>
                            <li>To comply with legal obligations</li>
                            <li>To protect our rights and safety</li>
                            <li>With service providers (like Razorpay for payments)</li>
                        </ul>

                        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mt-8 mb-4">
                            4. Data Security
                        </h2>
                        <p className="text-gray-700 dark:text-gray-300 mb-4">
                            We implement appropriate security measures to protect your personal information:
                        </p>
                        <ul className="text-gray-700 dark:text-gray-300 mb-4 list-disc pl-6">
                            <li>Secure data transmission (HTTPS)</li>
                            <li>Firebase security rules</li>
                            <li>Regular security updates</li>
                            <li>Limited access to personal data</li>
                        </ul>

                        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mt-8 mb-4">
                            5. Cookies and Tracking
                        </h2>
                        <p className="text-gray-700 dark:text-gray-300 mb-4">
                            We use cookies and similar technologies to:
                        </p>
                        <ul className="text-gray-700 dark:text-gray-300 mb-4 list-disc pl-6">
                            <li>Remember your login status</li>
                            <li>Save your reading preferences</li>
                            <li>Analyze website usage</li>
                            <li>Improve user experience</li>
                        </ul>

                        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mt-8 mb-4">
                            6. Your Rights
                        </h2>
                        <p className="text-gray-700 dark:text-gray-300 mb-4">
                            You have the right to:
                        </p>
                        <ul className="text-gray-700 dark:text-gray-300 mb-4 list-disc pl-6">
                            <li>Access your personal data</li>
                            <li>Correct inaccurate information</li>
                            <li>Delete your account and data</li>
                            <li>Export your data</li>
                            <li>Opt-out of marketing communications</li>
                        </ul>

                        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mt-8 mb-4">
                            7. Third-Party Services
                        </h2>
                        <p className="text-gray-700 dark:text-gray-300 mb-4">
                            We use the following third-party services:
                        </p>
                        <ul className="text-gray-700 dark:text-gray-300 mb-4 list-disc pl-6">
                            <li><strong>Google Firebase:</strong> Database and authentication</li>
                            <li><strong>Razorpay:</strong> Payment processing</li>
                            <li><strong>Google OAuth:</strong> Social login</li>
                            <li><strong>Vercel:</strong> Website hosting</li>
                        </ul>

                        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mt-8 mb-4">
                            8. Children's Privacy
                        </h2>
                        <p className="text-gray-700 dark:text-gray-300 mb-4">
                            Our service is not intended for children under 13. We do not knowingly collect personal information from children under 13.
                        </p>

                        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mt-8 mb-4">
                            9. Changes to Privacy Policy
                        </h2>
                        <p className="text-gray-700 dark:text-gray-300 mb-4">
                            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page.
                        </p>

                        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mt-8 mb-4">
                            10. Contact Us
                        </h2>
                        <p className="text-gray-700 dark:text-gray-300 mb-4">
                            If you have questions about this Privacy Policy, please contact us at:
                            <br />
                            Email: privacy@bluefmnovel.com
                            <br />
                            Website: BlueFM Novel
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
