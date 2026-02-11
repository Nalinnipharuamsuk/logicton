import { NextResponse } from 'next/server';
import { getSiteConfig } from '@/lib/content';
import type { ApiResponse } from '@/types';

export async function GET() {
  try {
    const data = await getSiteConfig();

    if (!data) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Site configuration not found' },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse>({ success: true, data }, {
      headers: {
        'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=900'
      }
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch site configuration' },
      { status: 500 }
    );
  }
}