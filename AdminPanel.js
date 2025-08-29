const { useState, useEffect, useContext } = React;

const AdminPanel = ({ setCurrentView }) => {
    const { isAdmin } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState('novels');
    const [novels, setNovels] = useState([]);
    const [memberships, setMemberships] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingNovel, setEditingNovel] = useState(null);
    
    useEffect(() => {
        if (!isAdmin) {
            setCurrentView('home');
            return;
        }
        
        // Fetch all data
        fetchNovels();
        fetchMemberships();
        fetchUsers();
    }, [isAdmin]);
    
    const fetchNovels = () => {
        const unsubscribe = db.collection('novels')
            .orderBy('createdAt', 'desc')
            .onSnapshot(snapshot => {
                const novelsData = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setNovels(novelsData);
                setLoading(false);
            });
        return unsubscribe;
    };
    
    const fetchMemberships = () => {
        const unsubscribe = db.collection('memberships')
            .orderBy('purchaseDate', 'desc')
            .onSnapshot(snapshot => {
                const membershipData = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setMemberships(membershipData);
            });
        return unsubscribe;
    };
    
    const fetchUsers = () => {
        const unsubscribe = db.collection('users')
            .orderBy('lastLogin', 'desc')
            .onSnapshot(snapshot => {
                const userData = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setUsers(userData);
            });
        return unsubscribe;
    };
    
    const handleDeleteNovel = async (novelId) => {
        if (confirm('Are you sure you want to delete this novel?')) {
            try {
                await db.collection('novels').doc(novelId).delete();
                alert('Novel deleted successfully');
            } catch (error) {
                alert('Error deleting novel: ' + error.message);
            }
        }
    };
    
    const handleTogglePublish = async (novelId, currentStatus) => {
        try {
            await db.collection('novels').doc(novelId).update({
                published: !currentStatus
            });
        } catch (error) {
            alert('Error updating novel: ' + error.message);
        }
    };
    
    // Calculate stats
    const totalRevenue = memberships.reduce((sum, m) => sum + (m.amount || 0), 0);
    const activeMemberships = memberships.filter(m => {
        if (!m.expiryDate) return false;
        const expiryDate = m.expiryDate.toDate ? m.expiryDate.toDate() : new Date(m.expiryDate);
        return expiryDate > new Date();
    }).length;
    
    const NovelForm = ({ novel, onClose }) => {
        const [formData, setFormData] = useState({
            title: novel?.title || '',
            author: novel?.author || '',
            genre: novel?.genre || 'Fantasy',
            status: novel?.status || 'Ongoing',
            summary: novel?.summary || '',
            coverUrl: novel?.coverUrl || '',
            published: novel?.published || false,
            featured: novel?.featured || false
        });
        const [chapters, setChapters] = useState(novel?.chapters || []);
        const [uploading, setUploading] = useState(false);
        
     const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        alert('File size should be less than 5MB');
        return;
    }
    
    // Check file type
    if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
    }
    
    setUploading(true);
    try {
        // Create unique filename
        const timestamp = Date.now();
        const fileName = `${timestamp}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
        
        // Upload to Firebase Storage
        const storageRef = storage.ref(`covers/${fileName}`);
        
        // Add metadata
        const metadata = {
            contentType: file.type,
            customMetadata: {
                'uploadedBy': auth.currentUser?.email || 'unknown',
                'uploadedAt': new Date().toISOString()
            }
        };
        
        const snapshot = await storageRef.put(file, metadata);
        const url = await snapshot.ref.getDownloadURL();
        
        setFormData({ ...formData, coverUrl: url });
        alert('Image uploaded successfully!');
        
    } catch (error) {
        console.error('Upload error:', error);
        
        // Better error messages
        if (error.code === 'storage/unauthorized') {
            alert('Permission denied. Please check Firebase Storage rules or contact admin.');
        } else if (error.code === 'storage/quota-exceeded') {
            alert('Storage quota exceeded. Please contact admin.');
        } else {
            alert('Error uploading image: ' + error.message);
        }
    } finally {
        setUploading(false);
    }
};
        
        const handleAddChapter = () => {
            const newChapter = {
                id: `chapter-${Date.now()}`,
                number: chapters.length + 1,
                title: '',
                content: '',
                readTime: '10 min'
            };
            setChapters([...chapters, newChapter]);
        };
        
        const handleChapterChange = (index, field, value) => {
            const updatedChapters = [...chapters];
            updatedChapters[index][field] = value;
            setChapters(updatedChapters);
        };
        
        const handleRemoveChapter = (index) => {
            setChapters(chapters.filter((_, i) => i !== index));
        };
        
        const handleSubmit = async (e) => {
            e.preventDefault();
            
            const novelData = {
                ...formData,
                chapters,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            };
            
            if (!novel) {
                novelData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
                novelData.views = 0;
                novelData.bookmarkCount = 0;
                novelData.rating = 4.0;
            }
            
            try {
                if (novel) {
                    await db.collection('novels').doc(novel.id).update(novelData);
                    alert('Novel updated successfully');
                } else {
                    await db.collection('novels').add(novelData);
                    alert('Novel added successfully');
                }
                onClose();
            } catch (error) {
                alert('Error saving novel: ' + error.message);
            }
        };
        
        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                    <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                            {novel ? 'Edit Novel' : 'Add New Novel'}
                        </h2>
                    </div>
                    
                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                                    Title *
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                                    Author *
                                </label>
                                <input
                                    type="text"
                                    value={formData.author}
                                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                                    Genre
                                </label>
                                <select
                                    value={formData.genre}
                                    onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                >
                                    <option value="Romance">Romance</option>
                                    <option value="Fantasy">Fantasy</option>
                                    <option value="Thriller">Thriller</option>
                                    <option value="Sci-Fi">Sci-Fi</option>
                                    <option value="Mystery">Mystery</option>
                                    <option value="Adventure">Adventure</option>
                                    <option value="Drama">Drama</option>
                                    <option value="Action">Action</option>
                                </select>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                                    Status
                                </label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                >
                                    <option value="Ongoing">Ongoing</option>
                                    <option value="Completed">Completed</option>
                                </select>
                            </div>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                                Summary *
                            </label>
                            <textarea
                                value={formData.summary}
                                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                                required
                                rows={4}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                                Cover Image
                            </label>
                            <div className="flex items-center gap-4">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="flex-1"
                                />
                                {formData.coverUrl && (
                                    <img src={formData.coverUrl} alt="Cover" className="w-20 h-28 object-cover rounded" />
                                )}
                            </div>
                            {uploading && <p className="text-sm text-gray-500 mt-2">Uploading...</p>}
                        </div>
                        
                        <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={formData.published}
                                    onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                                    className="rounded"
                                />
                                <span className="text-sm text-gray-700 dark:text-gray-300">Published</span>
                            </label>
                            
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={formData.featured}
                                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                                    className="rounded"
                                />
                                <span className="text-sm text-gray-700 dark:text-gray-300">Featured</span>
                            </label>
                        </div>
                        
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Chapters</h3>
                                <button
                                    type="button"
                                    onClick={handleAddChapter}
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                >
                                    Add Chapter
                                </button>
                            </div>
                            
                            <div className="space-y-4">
                                {chapters.map((chapter, index) => (
                                    <div key={chapter.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <h4 className="font-medium text-gray-900 dark:text-gray-100">
                                                Chapter {index + 1}
                                            </h4>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveChapter(index)}
                                                className="text-red-600 hover:text-red-700"
                                            >
                                                <Icon name="trash-2" className="w-5 h-5" />
                                            </button>
                                        </div>
                                        
                                        <div className="space-y-2">
                                            <input
                                                type="text"
                                                placeholder="Chapter title"
                                                value={chapter.title}
                                                onChange={(e) => handleChapterChange(index, 'title', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                            />
                                            <textarea
                                                placeholder="Chapter content"
                                                value={chapter.content}
                                                onChange={(e) => handleChapterChange(index, 'content', e.target.value)}
                                                rows={6}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        <div className="flex justify-end gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-6 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={uploading}
                                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                            >
                                {novel ? 'Update Novel' : 'Add Novel'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    };
    
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                        Admin Panel
                    </h1>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
                    >
                        <Icon name="plus" className="w-5 h-5" />
                        Add Novel
                    </button>
                </div>
                
                {/* Tabs */}
                <div className="flex gap-4 mb-6 border-b border-gray-200 dark:border-gray-800 overflow-x-auto">
                    <button
                        onClick={() => setActiveTab('novels')}
                        className={`pb-2 px-1 font-medium transition-colors whitespace-nowrap ${
                            activeTab === 'novels'
                                ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
                                : 'text-gray-600 dark:text-gray-400'
                        }`}
                    >
                        Novels
                    </button>
                    <button
                        onClick={() => setActiveTab('memberships')}
                        className={`pb-2 px-1 font-medium transition-colors whitespace-nowrap ${
                            activeTab === 'memberships'
                                ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
                                : 'text-gray-600 dark:text-gray-400'
                        }`}
                    >
                        Memberships ({activeMemberships})
                    </button>
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`pb-2 px-1 font-medium transition-colors whitespace-nowrap ${
                            activeTab === 'users'
                                ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
                                : 'text-gray-600 dark:text-gray-400'
                        }`}
                    >
                        Users ({users.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('stats')}
                        className={`pb-2 px-1 font-medium transition-colors whitespace-nowrap ${
                            activeTab === 'stats'
                                ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
                                : 'text-gray-600 dark:text-gray-400'
                        }`}
                    >
                        Statistics
                    </button>
                </div>
                
                {/* Novels Tab */}
                {activeTab === 'novels' && (
                    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-200 dark:border-gray-800">
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Title</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Author</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Genre</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Status</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Views</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Published</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan="7" className="px-4 py-8 text-center">
                                                <LoadingSpinner />
                                            </td>
                                        </tr>
                                    ) : novels.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                                                No novels found
                                            </td>
                                        </tr>
                                    ) : (
                                        novels.map(novel => (
                                            <tr key={novel.id} className="border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800">
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        {novel.coverUrl && (
                                                            <img src={novel.coverUrl} alt={novel.title} className="w-10 h-14 object-cover rounded" />
                                                        )}
                                                        <span className="font-medium text-gray-900 dark:text-gray-100">{novel.title}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{novel.author}</td>
                                                <td className="px-4 py-3">
                                                    <span className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-full text-xs">
                                                        {novel.genre}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`px-2 py-1 rounded-full text-xs ${
                                                        novel.status === 'Completed'
                                                            ? 'bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400'
                                                            : 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-600 dark:text-yellow-400'
                                                    }`}>
                                                        {novel.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{novel.views || 0}</td>
                                                <td className="px-4 py-3">
                                                    <button
                                                        onClick={() => handleTogglePublish(novel.id, novel.published)}
                                                        className={`px-2 py-1 rounded-full text-xs ${
                                                            novel.published
                                                                ? 'bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400'
                                                                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                                                        }`}
                                                    >
                                                        {novel.published ? 'Published' : 'Draft'}
                                                    </button>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => {
                                                                setEditingNovel(novel);
                                                                setShowAddModal(true);
                                                            }}
                                                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                                                        >
                                                            <Icon name="edit" className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteNovel(novel.id)}
                                                            className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded"
                                                        >
                                                            <Icon name="trash-2" className="w-4 h-4 text-red-600 dark:text-red-400" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
                
                {/* Memberships Tab */}
                {activeTab === 'memberships' && (
                    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
                        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                Membership Purchases
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Total Revenue: ₹{totalRevenue} | Active: {activeMemberships}
                            </p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-200 dark:border-gray-800">
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">User</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Amount</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Payment ID</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Purchase Date</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Expiry</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan="6" className="px-4 py-8 text-center">
                                                <LoadingSpinner />
                                            </td>
                                        </tr>
                                    ) : memberships.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                                                No memberships purchased yet
                                            </td>
                                        </tr>
                                    ) : (
                                        memberships.map(membership => {
                                            const user = users.find(u => u.id === membership.userId);
                                            const expiryDate = membership.expiryDate?.toDate ? membership.expiryDate.toDate() : new Date(membership.expiryDate);
                                            const isActive = expiryDate > new Date();
                                            const purchaseDate = membership.purchaseDate?.toDate ? membership.purchaseDate.toDate() : new Date();
                                            
                                            return (
                                                <tr key={membership.id} className="border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800">
                                                    <td className="px-4 py-3">
                                                        <div>
                                                            <p className="font-medium text-gray-900 dark:text-gray-100">
                                                                {user?.displayName || user?.email || 'Unknown User'}
                                                            </p>
                                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                                {user?.email}
                                                            </p>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                                                        ₹{membership.amount}
                                                    </td>
                                                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                                                        <span className="font-mono text-xs">
                                                            {membership.paymentId?.substring(0, 20)}...
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                                                        {purchaseDate.toLocaleDateString()}
                                                    </td>
                                                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                                                        {expiryDate.toLocaleDateString()}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className={`px-2 py-1 rounded-full text-xs ${
                                                            isActive
                                                                ? 'bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400'
                                                                : 'bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400'
                                                        }`}>
                                                            {isActive ? 'Active' : 'Expired'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
                
                {/* Users Tab */}
                {activeTab === 'users' && (
                    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
                        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                Registered Users
                            </h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-200 dark:border-gray-800">
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">User</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Email</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Last Login</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Membership</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(user => {
                                        const userMembership = memberships.find(m => m.userId === user.id);
                                        const hasMembership = userMembership && userMembership.expiryDate?.toDate() > new Date();
                                        
                                        return (
                                            <tr key={user.id} className="border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800">
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        {user.photoURL ? (
                                                            <img src={user.photoURL} alt="Avatar" className="w-8 h-8 rounded-full" />
                                                        ) : (
                                                            <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white text-sm">
                                                                {user.displayName?.[0] || user.email?.[0] || 'U'}
                                                            </div>
                                                        )}
                                                        <span className="font-medium text-gray-900 dark:text-gray-100">
                                                            {user.displayName || 'Anonymous User'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                                                    {user.email}
                                                </td>
                                                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                                                    {user.lastLogin?.toDate ? user.lastLogin.toDate().toLocaleDateString() : 'Never'}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`px-2 py-1 rounded-full text-xs ${
                                                        hasMembership
                                                            ? 'bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400'
                                                            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                                                    }`}>
                                                        {hasMembership ? 'Premium' : 'Free'}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
                
                {/* Statistics Tab */}
                {activeTab === 'stats' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <Icon name="book" className="w-8 h-8 text-indigo-600" />
                                <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                    {novels.length}
                                </span>
                            </div>
                            <h3 className="text-gray-600 dark:text-gray-400">Total Novels</h3>
                        </div>
                        
                        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <Icon name="users" className="w-8 h-8 text-blue-600" />
                                <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                    {users.length}
                                </span>
                            </div>
                            <h3 className="text-gray-600 dark:text-gray-400">Total Users</h3>
                        </div>
                        
                        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <Icon name="crown" className="w-8 h-8 text-yellow-600" />
                                <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                    {activeMemberships}
                                </span>
                            </div>
                            <h3 className="text-gray-600 dark:text-gray-400">Active Members</h3>
                        </div>
                        
                        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <Icon name="indian-rupee" className="w-8 h-8 text-green-600" />
                                <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                    ₹{totalRevenue}
                                </span>
                            </div>
                            <h3 className="text-gray-600 dark:text-gray-400">Total Revenue</h3>
                        </div>
                        
                        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <Icon name="eye" className="w-8 h-8 text-purple-600" />
                                <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                    {novels.reduce((sum, n) => sum + (n.views || 0), 0)}
                                </span>
                            </div>
                            <h3 className="text-gray-600 dark:text-gray-400">Total Views</h3>
                        </div>
                        
                        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <Icon name="check-circle" className="w-8 h-8 text-emerald-600" />
                                <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                    {novels.filter(n => n.published).length}
                                </span>
                            </div>
                            <h3 className="text-gray-600 dark:text-gray-400">Published</h3>
                        </div>
                        
                        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <Icon name="bookmark" className="w-8 h-8 text-pink-600" />
                                <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                    {novels.reduce((sum, n) => sum + (n.bookmarkCount || 0), 0)}
                                </span>
                            </div>
                            <h3 className="text-gray-600 dark:text-gray-400">Total Bookmarks</h3>
                        </div>
                        
                        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <Icon name="percent" className="w-8 h-8 text-orange-600" />
                                <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                    {users.length > 0 ? Math.round((activeMemberships / users.length) * 100) : 0}%
                                </span>
                            </div>
                            <h3 className="text-gray-600 dark:text-gray-400">Conversion Rate</h3>
                        </div>
                    </div>
                )}
            </div>
            
            {showAddModal && (
                <NovelForm
                    novel={editingNovel}
                    onClose={() => {
                        setShowAddModal(false);
                        setEditingNovel(null);
                    }}
                />
            )}
        </div>
    );
};

