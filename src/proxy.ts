import { type NextRequest } from 'next/server';
import { updateSession } from '@/utils/supabase/middleware';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

export default async function proxy(request: NextRequest) {
  // Update the Supabase session
  // In Next.js 16, proxy.ts handles the Node-based request boundary
  const supabaseResponse = await updateSession(request);
  
  // Run the intl middleware
  const response = intlMiddleware(request);

  // Merge Supabase cookies into the intl response
  supabaseResponse.cookies.getAll().forEach((cookie) => {
    response.cookies.set(cookie.name, cookie.value, {
      ...cookie,
    });
  });

  return response;
}

export const config = {
  // Match all pathnames except for:
  // - /api routes
  // - /_next (Next.js internals)
  // - /_vercel (Vercel internals)  
  // - Static files with extensions (e.g. .ico, .png, .jpg)
  matcher: ['/', '/((?!api|_next|_vercel|.*\\..*).*)']
};
