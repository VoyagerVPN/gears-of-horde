'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';

export default function NotFound() {
    const t = useTranslations('SearchPage'); // Reusing existing translation namespace if possible, or fallback

    return (
        <main className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
            <h1 className="text-6xl font-bold mb-4">404</h1>
            <h2 className="text-2xl font-semibold mb-6">Page Not Found</h2>
            <p className="text-zinc-400 mb-8 max-w-md">
                Sorry, the page you are looking for does not exist or has been moved.
            </p>
            <Link
                href="/"
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
                Return Home
            </Link>
        </main>
    );
}
