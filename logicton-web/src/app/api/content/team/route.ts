import { NextRequest, NextResponse } from 'next/server';
import { getTeamMembers, updateTeamMembers, generateId } from '@/lib/content';
import type { TeamMember, ApiResponse } from '@/types';
import { teamPayloadSchema } from '@/lib/validation';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const data = await getTeamMembers();

    return NextResponse.json<ApiResponse>({ success: true, data }, {
      headers: {
        'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=900'
      }
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch team content' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const currentMembers = await getTeamMembers();

    // Create new team member
    const newMember: TeamMember = {
      id: generateId('team'),
      name: body.name || { th: '', en: '' },
      role: body.role || { th: '', en: '' },
      bio: body.bio || { th: '', en: '' },
      photo: body.photo || '',
      email: body.email || '',
      linkedin: body.linkedin || '',
      order: body.order || (currentMembers.length + 1),
      isActive: body.isActive !== undefined ? body.isActive : true,
    };

    // Validate
    const members = [...currentMembers, newMember];
    const parsed = teamPayloadSchema.safeParse({ members });

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid data format' },
        { status: 400 }
      );
    }

    // Save
    const success = await updateTeamMembers(members);

    if (success) {
      return NextResponse.json<ApiResponse>({
        success: true,
        data: newMember,
        message: 'Team member added successfully'
      }, { status: 201 });
    } else {
      return NextResponse.json(
        { success: false, error: 'Failed to save team member' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error creating team member:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create team member' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const currentMembers = await getTeamMembers();

    // Find and update the member
    const memberIndex = currentMembers.findIndex(m => m.id === body.id);

    if (memberIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Team member not found' },
        { status: 404 }
      );
    }

    // Update member
    const updatedMember: TeamMember = {
      ...currentMembers[memberIndex],
      ...body,
      id: body.id, // Ensure ID is not changed
    };

    currentMembers[memberIndex] = updatedMember;

    // Validate
    const parsed = teamPayloadSchema.safeParse({ members: currentMembers });

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid data format' },
        { status: 400 }
      );
    }

    // Save
    const success = await updateTeamMembers(currentMembers);

    if (success) {
      return NextResponse.json<ApiResponse>({
        success: true,
        data: updatedMember,
        message: 'Team member updated successfully'
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Failed to update team member' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error updating team member:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update team member' },
      { status: 500 }
    );
  }
}