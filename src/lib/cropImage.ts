/**
 * Creates a cropped image from the source image and pixel crop area.
 * Uses canvas to perform the crop client-side before upload.
 * 
 * For banners: Output is exactly 1000x219 pixels (no further downscaling).
 */

interface PixelCrop {
    x: number;
    y: number;
    width: number;
    height: number;
}

/**
 * Create an image element from a URL
 */
function createImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.addEventListener('load', () => resolve(image));
        image.addEventListener('error', (error) => reject(error));
        image.setAttribute('crossOrigin', 'anonymous');
        image.src = url;
    });
}

/**
 * Get the cropped image as a Blob
 * @param outputWidth - Exact output width (e.g., 1000 for banners)
 * @param outputHeight - Exact output height (e.g., 219 for banners)
 */
export async function getCroppedImg(
    imageSrc: string,
    pixelCrop: PixelCrop,
    outputWidth?: number,
    outputHeight?: number
): Promise<Blob> {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
        throw new Error('Could not get canvas context');
    }

    // Set canvas size to exact output dimensions (no downscaling for banners)
    canvas.width = outputWidth || pixelCrop.width;
    canvas.height = outputHeight || pixelCrop.height;

    // Fill with dark background first (prevents transparent areas from becoming white)
    ctx.fillStyle = '#191919'; // Match website background color
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw the cropped image at exact output resolution
    ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        canvas.width,
        canvas.height
    );

    // Convert to blob - high quality WebP (0.95 for banners to preserve quality)
    return new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
            (blob) => {
                if (blob) {
                    resolve(blob);
                } else {
                    reject(new Error('Could not create blob from canvas'));
                }
            },
            'image/webp',
            0.95 // High quality - banners are exactly 1000x219
        );
    });
}

/**
 * Convert a File to a base64 data URL
 */
export function fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

