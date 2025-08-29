const TermsPage = ({ setCurrentView }) => {
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
                        Terms and Conditions
                    </h1>
                    
                    <div className="prose dark:prose-invert max-w-none">
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            <strong>Last updated:</strong> {new Date().toLocaleDateString()}
                        </p>

                        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mt-8 mb-4">
                            1. Acceptance of Terms
                        </h2>
                        <p className="text-gray-700 dark:text-gray-300 mb-4">
                            By accessing and using BlueFM Novel ("the Service"), you accept and agree to be bound by the terms and provision of this agreement.
                        </p>

                        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mt-8 mb-4">
                            2. Service Description
                        </h2>
                        <p className="text-gray-700 dark:text-gray-300 mb-4">
                            BlueFM Novel is an online platform that provides access to digital novels and reading content. We offer both free and premium membership options.
                        </p>

                        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mt-8 mb-4">
                            3. Premium Membership
                        </h2>
                        <ul className="text-gray-700 dark:text-gray-300 mb-4 list-disc pl-6">
                            <li>Premium membership costs ₹9 per year</li>
                            <li>Provides unlimited access to all novels</li>
                            <li>Ad-free reading experience</li>
                            <li>Early access to new content</li>
                            <li>Membership is non-transferable</li>
                        </ul>

                        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mt-8 mb-4">
                            4. User Accounts
                        </h2>
                        <ul className="text-gray-700 dark:text-gray-300 mb-4 list-disc pl-6">
                            <li>You must provide accurate information when creating an account</li>
                            <li>You are responsible for maintaining account security</li>
                            <li>One account per person</li>
                            <li>We reserve the right to suspend accounts for violations</li>
                        </ul>

                        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mt-8 mb-4">
                            5. Prohibited Uses
                        </h2>
                        <ul className="text-gray-700 dark:text-gray-300 mb-4 list-disc pl-6">
                            <li>Sharing account credentials</li>
                            <li>Downloading or distributing content without permission</li>
                            <li>Using automated tools to access the service</li>
                            <li>Attempting to hack or disrupt the service</li>
                        </ul>

                        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mt-8 mb-4">
                            6. Intellectual Property
                        </h2>
                        <p className="text-gray-700 dark:text-gray-300 mb-4">
                            All content on BlueFM Novel, including novels, text, graphics, and software, is protected by copyright and other intellectual property laws.
                        </p>

                        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mt-8 mb-4">
                            7. Limitation of Liability
                        </h2>
                        <p className="text-gray-700 dark:text-gray-300 mb-4">
                            BlueFM Novel shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the service.
                        </p>

                        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mt-8 mb-4">
                            8. Changes to Terms
                        </h2>
                        <p className="text-gray-700 dark:text-gray-300 mb-4">
                            We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting on the website.
                        </p>

                        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mt-8 mb-4">
                            9. Contact Information
                        </h2>
                        <p className="text-gray-700 dark:text-gray-300 mb-4">
                            For questions about these Terms and Conditions, please contact us at:
                            <br />
                            Email: support@bluefmnovel.com
                            <br />
                            Website: BlueFM Novel
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
