import { NextResponse } from 'next/server';
import { getContactInquiries, getInquiryStats } from '@/lib/contact-inquiries';
import type { ApiResponse } from '@/types';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated and is admin
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Extend types for session user to check role if needed, assuming role is on user
    if ((session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const inquiries = await getContactInquiries();
    const stats = await getInquiryStats();

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        inquiries,
        stats
      }
    });
  } catch (error) {
    console.error('Error fetching contact inquiries:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to fetch contact inquiries' },
      { status: 500 }
    );
  }
}
