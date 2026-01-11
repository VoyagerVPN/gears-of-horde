'use client';

import { useEffect } from 'react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <main className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
            <h1 className="text-4xl font-bold mb-4 text-red-500">Something went wrong!</h1>
            <p className="text-zinc-400 mb-8 max-w-md">
                An unexpected error has occurred. Our team has been notified.
            </p>
            <button
                onClick={reset}
                className="bg-zinc-700 hover:bg-zinc-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
                Try again
            </button>
        </main>
    );
}
