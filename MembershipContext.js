const { useState, useEffect, createContext, useContext } = React;

const MembershipContext = createContext();

const MembershipProvider = ({ children }) => {
    const [hasMembership, setHasMembership] = useState(false);
    const [loading, setLoading] = useState(true);
    const { user } = useContext(AuthContext);
    
    // Check membership status
    useEffect(() => {
        if (user) {
            checkMembershipStatus();
        } else {
            setHasMembership(false);
            setLoading(false);
        }
    }, [user]);
    
    const checkMembershipStatus = async () => {
        if (!user) return;
        
        try {
            const membershipDoc = await db.collection('memberships').doc(user.uid).get();
            if (membershipDoc.exists) {
                const data = membershipDoc.data();
                const expiryDate = data.expiryDate?.toDate();
                const isActive = expiryDate && expiryDate > new Date();
                setHasMembership(isActive);
            } else {
                setHasMembership(false);
            }
        } catch (error) {
            console.error('Error checking membership:', error);
            setHasMembership(false);
        } finally {
            setLoading(false);
        }
    };
    
    const purchaseMembership = async () => {
        if (!user) {
            alert('Please login first');
            return;
        }
        
        try {
            // Razorpay options with your API key
            const options = {
                key: 'rzp_test_R8RKDDGjxvXtPW', // Your Razorpay key
                amount: 900, // ₹9 = 900 paise
                currency: 'INR',
                name: 'BlueFM Novel',
                description: 'Premium Membership - Unlimited Reading',
                image: 'https://cdn-icons-png.flaticon.com/512/3145/3145765.png', // Default logo
                handler: async function (response) {
                    // Payment successful
                    await saveMembership(response);
                },
                prefill: {
                    name: user.displayName || 'Reader',
                    email: user.email,
                },
                theme: {
                    color: '#4F46E5'
                },
                modal: {
                    ondismiss: function() {
                        console.log('Payment cancelled');
                    }
                }
            };
            
            const rzp = new window.Razorpay(options);
            rzp.open();
            
        } catch (error) {
            console.error('Payment error:', error);
            alert('Payment failed. Please try again.');
        }
    };
    
    const saveMembership = async (paymentResponse) => {
        try {
            const expiryDate = new Date();
            expiryDate.setFullYear(expiryDate.getFullYear() + 1); // 1 year membership
            
            await db.collection('memberships').doc(user.uid).set({
                userId: user.uid,
                paymentId: paymentResponse.razorpay_payment_id,
                amount: 9,
                currency: 'INR',
                status: 'active',
                purchaseDate: firebase.firestore.FieldValue.serverTimestamp(),
                expiryDate: firebase.firestore.Timestamp.fromDate(expiryDate),
                paymentResponse: paymentResponse
            });
            
            setHasMembership(true);
            alert('🎉 Membership activated! Enjoy unlimited reading!');
            
        } catch (error) {
            console.error('Error saving membership:', error);
            alert('Payment successful but there was an error. Please contact support.');
        }
    };
    
    return (
        <MembershipContext.Provider value={{
            hasMembership,
            loading,
            purchaseMembership,
            checkMembershipStatus
        }}>
            {children}
        </MembershipContext.Provider>
    );
};
