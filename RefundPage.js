const RefundPage = ({ setCurrentView }) => {
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
                        Cancellation and Refund Policy
                    </h1>
                    
                    <div className="prose dark:prose-invert max-w-none">
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            <strong>Last updated:</strong> {new Date().toLocaleDateString()}
                        </p>

                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
                            <div className="flex items-start gap-3">
                                <Icon name="info" className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                                <div>
                                    <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                                        Important Notice
                                    </h3>
                                    <p className="text-blue-800 dark:text-blue-200 text-sm">
                                        Our premium membership is priced at just ₹9 per year to provide affordable access to quality content. Please read our refund policy carefully before making a purchase.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mt-8 mb-4">
                            1. Refund Eligibility
                        </h2>
                        <p className="text-gray-700 dark:text-gray-300 mb-4">
                            Due to the digital nature of our service and the extremely low price point (₹9 per year), refunds are generally not provided. However, we may consider refunds in the following exceptional circumstances:
                        </p>
                        <ul className="text-gray-700 dark:text-gray-300 mb-4 list-disc pl-6">
                            <li>Technical issues preventing access to the service for more than 7 consecutive days</li>
                            <li>Duplicate payments made by mistake</li>
                            <li>Unauthorized transactions (subject to verification)</li>
                            <li>Service discontinuation within 30 days of purchase</li>
                        </ul>

                        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mt-8 mb-4">
                            2. Non-Refundable Situations
                        </h2>
                        <p className="text-gray-700 dark:text-gray-300 mb-4">
                            Refunds will NOT be provided in the following cases:
                        </p>
                        <ul className="text-gray-700 dark:text-gray-300 mb-4 list-disc pl-6">
                            <li>Change of mind after purchase</li>
                            <li>Dissatisfaction with content quality or selection</li>
                            <li>Inability to access due to user's technical issues</li>
                            <li>Account suspension due to terms violation</li>
                            <li>Partial usage of the membership period</li>
                            <li>Forgetting about the subscription</li>
                        </ul>

                        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mt-8 mb-4">
                            3. Refund Process
                        </h2>
                        <p className="text-gray-700 dark:text-gray-300 mb-4">
                            If you believe you qualify for a refund under our policy:
                        </p>
                        <ol className="text-gray-700 dark:text-gray-300 mb-4 list-decimal pl-6">
                            <li>Contact our support team at <strong>support@bluefmnovel.com</strong></li>
                            <li>Provide your payment ID and reason for refund request</li>
                            <li>Include any relevant screenshots or documentation</li>
                            <li>Allow 3-5 business days for review</li>
                            <li>If approved, refund will be processed within 7-10 business days</li>
                        </ol>

                        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mt-8 mb-4">
                            4. Cancellation Policy
                        </h2>
                        <p className="text-gray-700 dark:text-gray-300 mb-4">
                            <strong>Annual Membership:</strong> Our membership is valid for one full year from the date of purchase. There is no automatic renewal, so no cancellation is required.
                        </p>
                        <ul className="text-gray-700 dark:text-gray-300 mb-4 list-disc pl-6">
                            <li>Membership remains active until expiry date</li>
                            <li>No automatic billing or renewal</li>
                            <li>You can continue using the service until expiry</li>
                            <li>Account deletion can be requested anytime</li>
                        </ul>

                        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mt-8 mb-4">
                            5. Payment Issues
                        </h2>
                        <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mt-6 mb-3">
                            Failed Payments:
                        </h3>
                        <ul className="text-gray-700 dark:text-gray-300 mb-4 list-disc pl-6">
                            <li>If payment fails, no membership will be activated</li>
                            <li>No charges will be made for failed transactions</li>
                            <li>You can retry payment anytime</li>
                        </ul>

                        <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mt-6 mb-3">
                            Duplicate Payments:
                        </h3>
                        <ul className="text-gray-700 dark:text-gray-300 mb-4 list-disc pl-6">
                            <li>Contact us immediately with both payment IDs</li>
                            <li>We will refund the duplicate payment</li>
                            <li>Processing time: 5-7 business days</li>
                        </ul>

                        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mt-8 mb-4">
                            6. Refund Methods
                        </h2>
                        <p className="text-gray-700 dark:text-gray-300 mb-4">
                            Approved refunds will be processed through:
                        </p>
                        <ul className="text-gray-700 dark:text-gray-300 mb-4 list-disc pl-6">
                            <li>Original payment method (preferred)</li>
                            <li>Bank transfer (if original method unavailable)</li>
                            <li>UPI transfer (for UPI payments)</li>
                        </ul>

                        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mt-8 mb-4">
                            7. Dispute Resolution
                        </h2>
                        <p className="text-gray-700 dark:text-gray-300 mb-4">
                            If you're not satisfied with our refund decision:
                        </p>
                        <ol className="text-gray-700 dark:text-gray-300 mb-4 list-decimal pl-6">
                            <li>Contact our senior support team</li>
                            <li>Provide additional documentation if available</li>
                            <li>We will review your case within 2 business days</li>
                            <li>Final decision will be communicated via email</li>
                        </ol>

                        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mt-8 mb-4">
                            8. Contact Information
                        </h2>
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                            <p className="text-gray-700 dark:text-gray-300 mb-2">
                                <strong>For refund requests and support:</strong>
                            </p>
                            <p className="text-gray-700 dark:text-gray-300 mb-1">
                                📧 Email: <strong>support@bluefmnovel.com</strong>
                            </p>
                            <p className="text-gray-700 dark:text-gray-300 mb-1">
                                ⏰ Response time: Within 24 hours
                            </p>
                            <p className="text-gray-700 dark:text-gray-300">
                                🌐 Website: BlueFM Novel
                            </p>
                        </div>

                        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mt-6">
                            <div className="flex items-start gap-3">
                                <Icon name="alert-triangle" className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                                <div>
                                    <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-1">
                                        Before You Purchase
                                    </h3>
                                    <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                                        Please ensure you understand our service and refund policy. At ₹9 per year, we've priced our membership to be accessible to everyone while maintaining quality content.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
