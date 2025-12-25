import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

// 4.5MB limit for server uploads
const MAX_FILE_SIZE = 4.5 * 1024 * 1024;

export async function POST(request: Request): Promise<NextResponse> {
    try {
        const { searchParams } = new URL(request.url);
        const filename = searchParams.get('filename');
        const folder = searchParams.get('folder') || 'uploads';

        if (!filename) {
            return NextResponse.json(
                { error: 'Filename is required' },
                { status: 400 }
            );
        }

        // Get the content length header to check file size
        const contentLength = request.headers.get('content-length');
        if (contentLength && parseInt(contentLength) > MAX_FILE_SIZE) {
            return NextResponse.json(
                { error: 'File size exceeds 4.5MB limit' },
                { status: 413 }
            );
        }

        // Generate unique filename with timestamp
        const timestamp = Date.now();
        const uniqueFilename = `${folder}/${timestamp}-${filename}`;

        // Upload to Vercel Blob
        // - addRandomSuffix: false - we already have timestamp, avoid extra randomness
        // - cacheControlMaxAge: 31 days - match our image optimization cache
        const blob = await put(uniqueFilename, request.body as ReadableStream, {
            access: 'public',
            addRandomSuffix: false,
            cacheControlMaxAge: 2678400, // 31 days
        });

        return NextResponse.json(blob);
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json(
            { error: 'Failed to upload file' },
            { status: 500 }
        );
    }
}
