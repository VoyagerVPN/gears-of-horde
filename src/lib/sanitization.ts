import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitizes HTML strings to prevent XSS attacks while allowing safe formatting tags.
 * Use this in Server Actions before saving content to the database.
 */
export function sanitizeHtml(html: string): string {
    if (!html) return '';
    
    return DOMPurify.sanitize(html, {
        ALLOWED_TAGS: [
            'b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li', 
            'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span', 'blockquote',
            'code', 'pre'
        ],
        ALLOWED_ATTR: ['href', 'target', 'rel', 'class'],
    });
}

/**
 * Sanitizes a plain string to strip all HTML tags.
 */
export function stripHtml(html: string): string {
    if (!html) return '';
    return DOMPurify.sanitize(html, { ALLOWED_TAGS: [] });
}
