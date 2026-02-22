export default function Footer() {
    return (
        <footer className="w-full py-6 mt-auto">
            <div className="container-app text-center">
                <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                    ResQNet activates nearby citizens before official responders arrive.
                </p>
                <p className="text-xs mt-1" style={{ color: 'rgba(136,136,160,0.5)' }}>
                    © {new Date().getFullYear()} ResQNet — Emergency Response Network
                </p>
            </div>
        </footer>
    );
}
