'use server';

import { syncAllTags } from '@/app/actions/sync-tags';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const result = await syncAllTags();
        return NextResponse.json({ success: true, result });
    } catch (error) {
        console.error('Sync failed:', error);
        return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
    }
}
