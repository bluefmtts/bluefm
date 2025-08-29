const Icon = ({ name, className = "" }) => {
    useEffect(() => {
        lucide.createIcons();
    }, []);
    
    return <i data-lucide={name} className={className}></i>;
};
