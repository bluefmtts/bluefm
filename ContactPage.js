const { useState } = React;

const ContactPage = ({ setCurrentView }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            await db.collection('contact_messages').add({
                ...formData,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                status: 'new'
            });

            setSubmitted(true);
            setFormData({ name: '', email: '', subject: '', message: '' });
        } catch (error) {
            console.error('Error submitting form:', error);
            alert('Error sending message. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
            <div className="max-w-6xl mx-auto px-4 py-8">
                <button
                    onClick={() => setCurrentView('home')}
                    className="mb-6 flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                    <Icon name="arrow-left" className="w-5 h-5" />
                    Back to Home
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 p-8">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                            Contact Us
                        </h1>
                        
                        <p className="text-gray-600 dark:text-gray-400 mb-8">
                            We'd love to hear from you! Get in touch with us for any questions, suggestions, or support needs.
                        </p>

                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg flex items-center justify-center">
                                    <Icon name="mail" className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                                        Email Support
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                                        Get help with your account, payments, or technical issues
                                    </p>
                                    <a href="mailto:support@bluefmnovel.com" className="text-indigo-600 dark:text-indigo-400 hover:underline">
                                        support@bluefmnovel.com
                                    </a>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/50 rounded-lg flex items-center justify-center">
                                    <Icon name="message-circle" className="w-6 h-6 text-green-600 dark:text-green-400" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                                        General Inquiries
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                                        Questions about our service, partnerships, or feedback
                                    </p>
                                    <a href="mailto:hello@bluefmnovel.com" className="text-green-600 dark:text-green-400 hover:underline">
                                        hello@bluefmnovel.com
                                    </a>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/50 rounded-lg flex items-center justify-center">
                                    <Icon name="credit-card" className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                                        Payment & Refunds
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                                        Billing issues, refund requests, or payment problems
                                    </p>
                                    <a href="mailto:billing@bluefmnovel.com" className="text-orange-600 dark:text-orange-400 hover:underline">
                                        billing@bluefmnovel.com
                                    </a>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">
                                Response Times
                            </h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Support Issues:</span>
                                    <span className="text-gray-900 dark:text-gray-100 font-medium">Within 24 hours</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">General Inquiries:</span>
                                    <span className="text-gray-900 dark:text-gray-100 font-medium">1-2 business days</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Refund Requests:</span>
                                    <span className="text-gray-900 dark:text-gray-100 font-medium">3-5 business days</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 p-8">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                            Send us a Message
                        </h2>

                        {submitted ? (
                            <div className="text-center py-8">
                                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Icon name="check" className="w-8 h-8 text-green-600 dark:text-green-400" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                    Message Sent Successfully!
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 mb-4">
                                    Thank you for contacting us. We'll get back to you within 24 hours.
                                </p>
                                <button
                                    onClick={() => setSubmitted(false)}
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                                >
                                    Send Another Message
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Name *
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                            placeholder="Your full name"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Email *
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                            placeholder="your@email.com"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Subject *
                                    </label>
                                    <select
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                    >
                                        <option value="">Select a subject</option>
                                        <option value="Technical Support">Technical Support</option>
                                        <option value="Payment Issue">Payment Issue</option>
                                        <option value="Refund Request">Refund Request</option>
                                        <option value="Account Problem">Account Problem</option>
                                        <option value="Content Suggestion">Content Suggestion</option>
                                        <option value="Bug Report">Bug Report</option>
                                        <option value="Feature Request">Feature Request</option>
                                        <option value="General Inquiry">General Inquiry</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Message *
                                    </label>
                                    <textarea
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        required
                                        rows={6}
                                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-none"
                                        placeholder="Please describe your issue or inquiry in detail..."
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting || formData.message.length < 10}
                                    className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                                >
                                    {isSubmitting ? 'Sending Message...' : 'Send Message'}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
