import { NextResponse } from 'next/server';
import { updateInquiryStatus, deleteInquiry } from '@/lib/contact-inquiries';
import type { ApiResponse } from '@/types';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const body = await request.json();
    const { status } = body;

    if (!status || !['new', 'read'].includes(status)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Invalid status value' },
        { status: 400 }
      );
    }

    const success = await updateInquiryStatus(resolvedParams.id, status);

    if (!success) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Inquiry not found' },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Inquiry status updated successfully'
    });
  } catch (error) {
    console.error('Error updating inquiry status:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to update inquiry status' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const success = await deleteInquiry(resolvedParams.id);

    if (!success) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Inquiry not found' },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Inquiry deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting inquiry:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to delete inquiry' },
      { status: 500 }
    );
  }
}
