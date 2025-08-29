const ContentProtection = () => {
    useEffect(() => {
        // Disable right-click context menu (only on protected content)
        const disableRightClick = (e) => {
            if (e.target.closest('.protected-content')) {
                e.preventDefault();
                return false;
            }
        };

        // Disable text selection (only on protected content)
        const disableSelection = () => {
            const protectedElements = document.querySelectorAll('.protected-content');
            protectedElements.forEach(element => {
                element.style.userSelect = 'none';
                element.style.webkitUserSelect = 'none';
                element.style.mozUserSelect = 'none';
                element.style.msUserSelect = 'none';
            });
        };

        // Disable only copy shortcut (Ctrl+C)
        const disableCopy = (e) => {
            if (e.ctrlKey && e.keyCode === 67) {
                if (document.getSelection().toString().length > 0) {
                    e.preventDefault();
                    return false;
                }
            }
        };

        // Add event listeners
        document.addEventListener('contextmenu', disableRightClick);
        document.addEventListener('keydown', disableCopy);
        
        // Apply selection disable
        setTimeout(disableSelection, 1000);

        // Simple console message (no blocking)
        console.log('%c📚 BlueFM Novel', 'color: #4F46E5; font-size: 16px; font-weight: bold;');
        console.log('%cContent is protected by copyright.', 'color: #6B7280; font-size: 12px;');

        // Cleanup
        return () => {
            document.removeEventListener('contextmenu', disableRightClick);
            document.removeEventListener('keydown', disableCopy);
        };
    }, []);

    return null;
};
