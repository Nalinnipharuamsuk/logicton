import { NextResponse } from 'next/server';
import { getServices, updateServices } from '@/lib/content';
import type { ApiResponse, Service } from '@/types';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const data = await getServices();

    return NextResponse.json<ApiResponse>({ success: true, data }, {
      headers: {
        'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=900'
      }
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch services content' },
      { status: 500 }
    );
  }
}

// POST - Create new service
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Validate required fields
    if (!body.title || !body.title.en || !body.title.th || !body.description) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const currentServices = await getServices();
    const newService: Service = {
      id: `service_${Date.now()}`,
      title: body.title,
      description: body.description,
      features: body.features || { th: [], en: [] },
      technologies: body.technologies || [],
      icon: body.icon || '🚀',
      category: body.category || 'web',
      order: currentServices.length,
      isActive: body.isActive !== false
    };

    currentServices.push(newService);
    await updateServices(currentServices);

    return NextResponse.json<ApiResponse>({ success: true, data: newService }, { status: 201 });
  } catch (error) {
    console.error('Failed to create service:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create service' },
      { status: 500 }
    );
  }
}
