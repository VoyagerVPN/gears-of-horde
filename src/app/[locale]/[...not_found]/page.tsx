import { notFound } from 'next/navigation';

// This catch-all route handles any path that doesn't match existing routes
// It triggers the custom not-found.tsx page
export default function CatchAllPage() {
    notFound();
}
