/**
 * Client-side image compression utility using native Canvas API.
 * Optimizes images for Vercel Hobby Tier limits (Storage < 1GB, Bandwidth < 10GB).
 * 
 * Goals:
 * - Convert to WebP (smaller than JPEG/PNG)
 * - Max width/height: 1920px
 * - Target file size: < 500KB
 */

interface CompressionOptions {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number; // 0 to 1
    targetSizeKB?: number;
    backgroundColor?: string;
}

export async function compressImage(
    file: File,
    options: CompressionOptions = {}
): Promise<Blob> {
    const {
        maxWidth = 1920,
        maxHeight = 1920,
        quality = 0.8,
        targetSizeKB = 500,
        backgroundColor
    } = options;

    // If file is already small and correct format, maybe skip? 
    // But we usually want to standardize on WebP.

    return new Promise((resolve, reject) => {
        const img = new Image();
        const objectUrl = URL.createObjectURL(file);

        img.onload = () => {
            URL.revokeObjectURL(objectUrl);

            let width = img.width;
            let height = img.height;

            // Resize maintain aspect ratio
            if (width > maxWidth || height > maxHeight) {
                const ratio = Math.min(maxWidth / width, maxHeight / height);
                width = Math.round(width * ratio);
                height = Math.round(height * ratio);
            }

            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            if (!ctx) {
                reject(new Error('Failed to get canvas context'));
                return;
            }

            // Fill background (handle transparency for generic images)
            // Using a neutral background or verifying generic transparency needs?
            // User previously asked for #191919 for banners/screenshots specifically.
            // For a generic util, maybe we should allow passing background color or default to white/black?
            // Given the app theme (Mod portal), dark background is likely preferred for transparent PNGs 
            // to avoid white artifacts, BUT generic compression shouldn't assume background unless specified.
            // However, WebP supports transparency. 
            // Wait, canvas.toBlob type 'image/webp' PRESERVES transparency if we don't fillRect.
            // BUT user specifically asked to fix white background issues before.
            // Let's stick to transparency support by default (don't fillRect) UNLESS we know it causes issues.
            // User's previous issue was transparent PNGs turning white. 
            // That happens if converted to JPEG. WebP supports alpha.
            // I'll keep transparency by default.

            // Check if user specifically requested dark fill in previous context.
            // "Filled with dark background first (prevents transparent areas from becoming white)" 
            // This was for getCroppedImg. 
            // I will add a backgroundColor option.

            // Fill background if specified
            if (backgroundColor) {
                ctx.fillStyle = backgroundColor;
                ctx.fillRect(0, 0, width, height);
            }

            ctx.drawImage(img, 0, 0, width, height);

            // First attempt
            canvas.toBlob(
                (blob) => {
                    if (!blob) {
                        reject(new Error('Compression failed'));
                        return;
                    }

                    // Simple check - if size is too big, try lower quality?
                    // Implementing recursive reduction is complex, 0.8 1920px usually < 500KB.
                    // If not, we can do one more pass.

                    if (blob.size > targetSizeKB * 1024) {
                        // Retry with lower quality
                        canvas.toBlob(
                            (blob2) => {
                                if (blob2) resolve(blob2);
                                else resolve(blob); // Fallback to first attempt
                            },
                            'image/webp',
                            0.6
                        );
                    } else {
                        resolve(blob);
                    }
                },
                'image/webp',
                quality
            );
        };

        img.onerror = (err) => {
            URL.revokeObjectURL(objectUrl);
            reject(err);
        };

        img.src = objectUrl;
    });
}
