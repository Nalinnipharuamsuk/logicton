import { NextResponse } from 'next/server';
import { getTeamMembers, updateTeamMembers } from '@/lib/content';
import type { ApiResponse } from '@/types';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const id = resolvedParams.id;

    if (!id) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'ID is required' },
        { status: 400 }
      );
    }

    const currentMembers = await getTeamMembers();
    const memberIndex = currentMembers.findIndex(m => m.id === id);

    if (memberIndex === -1) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Team member not found' },
        { status: 404 }
      );
    }

    // Remove the member
    const updatedMembers = currentMembers.filter(m => m.id !== id);

    // Save
    const success = await updateTeamMembers(updatedMembers);

    if (success) {
      return NextResponse.json<ApiResponse>({
        success: true,
        message: 'Team member deleted successfully'
      });
    } else {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Failed to delete team member' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error deleting team member:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to delete team member' },
      { status: 500 }
    );
  }
}