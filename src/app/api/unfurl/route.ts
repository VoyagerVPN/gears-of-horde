import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import { getFixedLinkName } from '@/lib/utils';

// List of blocked hosts to prevent SSRF attacks
const BLOCKED_HOSTS = [
    'localhost',
    '127.0.0.1',
    '0.0.0.0',
    '::1',
    '10.',
    '172.16.',
    '172.17.',
    '172.18.',
    '172.19.',
    '172.20.',
    '172.21.',
    '172.22.',
    '172.23.',
    '172.24.',
    '172.25.',
    '172.26.',
    '172.27.',
    '172.28.',
    '172.29.',
    '172.30.',
    '172.31.',
    '192.168.',
    '169.254.',
];

function isBlockedHost(hostname: string): boolean {
    const lowerHostname = hostname.toLowerCase();
    return BLOCKED_HOSTS.some(blocked =>
        lowerHostname === blocked || lowerHostname.startsWith(blocked)
    );
}

function isValidUrl(urlString: string): boolean {
    try {
        const url = new URL(urlString);
        // Only allow http and https protocols
        if (url.protocol !== 'http:' && url.protocol !== 'https:') {
            return false;
        }
        // Block internal/private hosts
        if (isBlockedHost(url.hostname)) {
            return false;
        }
        return true;
    } catch {
        return false;
    }
}

interface UnfurlResult {
    success: boolean;
    title?: string;
    icon?: string;
    error?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse<UnfurlResult>> {
    try {
        const body = await request.json();
        const { url } = body;

        if (!url || typeof url !== 'string') {
            return NextResponse.json(
                { success: false, error: 'URL is required' },
                { status: 400 }
            );
        }

        if (!isValidUrl(url)) {
            return NextResponse.json(
                { success: false, error: 'Invalid or blocked URL' },
                { status: 400 }
            );
        }

        // Fetch the page HTML with a more realistic browser User-Agent
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
                'Accept-Encoding': 'gzip, deflate, br',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1',
            },
            signal: AbortSignal.timeout(8000), // 8 second timeout
        });

        // For 403/blocked sites, fallback to extracting site name from domain
        if (!response.ok) {
            const parsedUrl = new URL(url);
            // Hardcoded overrides for specific domains
            const fixedName = getFixedLinkName(url);
            const domainParts = parsedUrl.hostname.replace('www.', '').split('.');
            const siteName = fixedName || domainParts[0].charAt(0).toUpperCase() + domainParts[0].slice(1);

            const icon = `https://www.google.com/s2/favicons?domain=${parsedUrl.hostname}&sz=32`;

            return NextResponse.json(
                { success: true, title: siteName, icon },
                {
                    status: 200,
                    headers: {
                        'Cache-Control': 'public, max-age=86400, s-maxage=86400',
                    },
                }
            );
        }

        const html = await response.text();
        const $ = cheerio.load(html);

        // Extract title - prioritize Open Graph, fallback to <title>
        let title = $('meta[property="og:site_name"]').attr('content') // Site name is best for "Ko-Fi", "Discord", etc.
            || $('meta[property="og:title"]').attr('content')
            || $('meta[name="twitter:title"]').attr('content')
            || $('title').text()
            || '';

        // Clean up the title
        title = title.trim();

        // For titles that contain " - Site Name" or "Page Title | Site Name", try to extract just the site name
        // This is a heuristic that works for many sites
        if (title.includes(' | ')) {
            const parts = title.split(' | ');
            title = parts[parts.length - 1].trim(); // Usually site name is last
        } else if (title.includes(' - ') && !$('meta[property="og:site_name"]').attr('content')) {
            const parts = title.split(' - ');
            title = parts[parts.length - 1].trim();
        }

        // Hardcoded overrides for specific domains
        const fixedName = getFixedLinkName(url);
        if (fixedName) {
            title = fixedName;
        }

        // Get favicon/icon URL
        const parsedUrl = new URL(url);
        let icon = $('link[rel="icon"]').attr('href')
            || $('link[rel="shortcut icon"]').attr('href')
            || $('link[rel="apple-touch-icon"]').attr('href')
            || $('link[rel="apple-touch-icon-precomposed"]').attr('href')
            || '/favicon.ico';

        // Make icon URL absolute if it's relative
        if (icon && !icon.startsWith('http')) {
            if (icon.startsWith('//')) {
                icon = parsedUrl.protocol + icon;
            } else if (icon.startsWith('/')) {
                icon = `${parsedUrl.protocol}//${parsedUrl.host}${icon}`;
            } else {
                icon = `${parsedUrl.protocol}//${parsedUrl.host}/${icon}`;
            }
        }

        // Fallback to Google's favicon service if parsing failed
        if (!icon || icon === '/favicon.ico') {
            icon = `https://www.google.com/s2/favicons?domain=${parsedUrl.hostname}&sz=32`;
        }

        return NextResponse.json(
            { success: true, title, icon },
            {
                status: 200,
                headers: {
                    'Cache-Control': 'public, max-age=86400, s-maxage=86400', // Cache for 24 hours
                },
            }
        );

    } catch (error) {
        console.error('Unfurl error:', error);

        const message = error instanceof Error ? error.message : 'Unknown error';
        const stack = error instanceof Error ? error.stack : '';
        console.error('Unfurl error details:', { message, stack });

        // Check for timeout
        if (message.includes('timeout') || message.includes('aborted')) {
            return NextResponse.json(
                { success: false, error: 'Request timed out' },
                { status: 504 }
            );
        }

        return NextResponse.json(
            { success: false, error: `Failed to unfurl URL: ${message}` },
            { status: 500 }
        );
    }
}
