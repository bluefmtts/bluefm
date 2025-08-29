const AdvancedProtection = () => {
    useEffect(() => {
        // Only disable drag and drop on protected content
        const disableDragDrop = (e) => {
            if (e.target.closest('.protected-content')) {
                e.preventDefault();
                return false;
            }
        };

        // Clear clipboard on copy attempt (replace with copyright notice)
        const handleCopy = (e) => {
            const selection = document.getSelection().toString();
            if (selection.length > 50) { // Only if copying large text
                e.clipboardData.setData('text/plain', '© BlueFM Novel - Content Protected');
                e.preventDefault();
            }
        };

        // Add event listeners
        document.addEventListener('dragstart', disableDragDrop);
        document.addEventListener('drop', disableDragDrop);
        document.addEventListener('copy', handleCopy);

        // Cleanup
        return () => {
            document.removeEventListener('dragstart', disableDragDrop);
            document.removeEventListener('drop', disableDragDrop);
            document.removeEventListener('copy', handleCopy);
        };
    }, []);

    return null;
};
