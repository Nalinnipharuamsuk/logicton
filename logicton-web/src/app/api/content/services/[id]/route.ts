import { NextResponse } from 'next/server';
import { getServices, updateServices } from '@/lib/content';
import type { ApiResponse, Service } from '@/types';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET - Single service
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('[GET /api/content/services/[id]] Looking for service ID:', id);
    const services = await getServices();
    console.log('[GET /api/content/services/[id]] Total services:', services.length);
    console.log('[GET /api/content/services/[id]] Service IDs:', services.map(s => s.id));
    const service = services.find(s => s.id === id);
    console.log('[GET /api/content/services/[id]] Found service:', service ? service.id : 'NOT FOUND');

    if (!service) {
      console.error('[GET /api/content/services/[id]] Service not found for ID:', id);
      return NextResponse.json(
        { success: false, error: 'Service not found' },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse>({ success: true, data: service });
  } catch (error) {
    console.error('[GET /api/content/services/[id]] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch service' },
      { status: 500 }
    );
  }
}

// PUT - Update service
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const services = await getServices();
    const index = services.findIndex(s => s.id === id);

    if (index === -1) {
      return NextResponse.json(
        { success: false, error: 'Service not found' },
        { status: 404 }
      );
    }

    const updatedService: Service = {
      ...services[index],
      title: body.title,
      description: body.description,
      features: body.features || services[index].features,
      technologies: body.technologies || services[index].technologies,
      icon: body.icon || services[index].icon,
      category: body.category || services[index].category,
      order: body.order !== undefined ? body.order : services[index].order,
      isActive: body.isActive !== undefined ? body.isActive : services[index].isActive
    };

    services[index] = updatedService;
    await updateServices(services);

    return NextResponse.json<ApiResponse>({ success: true, data: updatedService });
  } catch (error) {
    console.error('Failed to update service:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update service' },
      { status: 500 }
    );
  }
}

// DELETE - Delete service
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const services = await getServices();
    const index = services.findIndex(s => s.id === id);

    if (index === -1) {
      return NextResponse.json(
        { success: false, error: 'Service not found' },
        { status: 404 }
      );
    }

    services.splice(index, 1);
    await updateServices(services);

    return NextResponse.json<ApiResponse>({ success: true, message: 'Service deleted successfully' });
  } catch (error) {
    console.error('Failed to delete service:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete service' },
      { status: 500 }
    );
  }
}