import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
    // Match all pathnames except for:
    // - /api routes
    // - /_next (Next.js internals)
    // - /_vercel (Vercel internals)  
    // - Static files with extensions (e.g. .ico, .png, .jpg)
    matcher: ['/', '/((?!api|_next|_vercel|.*\\..*).*)']
};
