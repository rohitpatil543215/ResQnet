import { Loader2 } from 'lucide-react';

export default function LoadingScreen({ message = 'Loading…' }) {
    return (
        <div className="fixed inset-0 flex flex-col items-center justify-center gap-4" style={{ background: 'var(--bg-primary)' }}>
            <div className="relative">
                <div className="w-12 h-12 rounded-full border-2 border-red-500/20 border-t-red-500 animate-spin-slow" />
            </div>
            <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                {message}
            </p>
        </div>
    );
}

export function Spinner({ size = 20 }) {
    return <Loader2 size={size} className="animate-spin-slow" style={{ color: 'var(--text-secondary)' }} />;
}
