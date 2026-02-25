import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

// 4.5MB limit for server uploads
const MAX_FILE_SIZE = 4.5 * 1024 * 1024;

export async function POST(request: Request): Promise<NextResponse> {
    try {
        const { searchParams } = new URL(request.url);
        const filename = searchParams.get('filename');
        const bucket = searchParams.get('folder') || 'screenshots'; // Default to screenshots bucket

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

        const supabase = await createClient();
        
        // Get the file content
        const blob = await request.blob();
        
        if (blob.size > MAX_FILE_SIZE) {
            return NextResponse.json(
                { error: 'File size exceeds 4.5MB limit' },
                { status: 413 }
            );
        }

        // Generate unique filename with timestamp
        const timestamp = Date.now();
        const filePath = `${timestamp}-${filename}`;

        // Upload to Supabase Storage
        const { data: _data, error } = await supabase.storage
            .from(bucket)
            .upload(filePath, blob, {
                contentType: blob.type,
                cacheControl: '2678400', // 31 days
                upsert: false
            });

        if (error) {
            console.error('Supabase storage error:', error);
            return NextResponse.json(
                { error: error.message },
                { status: 500 }
            );
        }

        // Get the public URL for the uploaded file
        const { data: { publicUrl } } = supabase.storage
            .from(bucket)
            .getPublicUrl(filePath);

        // Return the URL in a format compatible with components expecting PutBlobResult
        return NextResponse.json({ url: publicUrl });
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json(
            { error: 'Failed to upload file' },
            { status: 500 }
        );
    }
}
