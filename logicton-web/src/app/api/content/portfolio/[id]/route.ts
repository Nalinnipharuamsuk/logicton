import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import type { ApiResponse, PortfolioItem } from '@/types';

const dbConfig = {
  host: 'localhost',
  port: 3306,
  user: 'myuser',
  password: 'mypassword',
  database: 'mydatabase'
};

// GET single portfolio item
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;
    
    if (!id) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'ID is required' },
        { status: 400 }
      );
    }
    
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute(
      'SELECT * FROM PortfolioItem WHERE id = ?',
      [id]
    );
    await connection.end();
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const items = rows as any[];
    
    if (items.length === 0) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Portfolio item not found' },
        { status: 404 }
      );
    }
    
    const item = items[0];
    
    // Handle date safely
    let completedDate: Date;
    try {
      completedDate = item.completedDate instanceof Date ? item.completedDate : new Date(String(item.completedDate));
    } catch {
      completedDate = new Date();
    }
    
    // Handle technologies safely
    let technologies: string[];
    try {
      technologies = Array.isArray(item.technologies) ? item.technologies : String(item.technologies || '').split(',').map(t => t.trim()).filter(Boolean);
    } catch {
      technologies = [];
    }
    
    // Handle images safely
    let images: string[];
    try {
      images = [String(item.images || '/images/placeholder.png')];
    } catch {
      images = ['/images/placeholder.png'];
    }
    
    const formattedData: PortfolioItem = {
      id: String(item.id),
      title: {
        th: String(item.titleTh || ''),
        en: String(item.titleEn || '')
      },
      description: {
        th: String(item.descriptionTh || ''),
        en: String(item.descriptionEn || '')
      },
      client: {
        name: String(item.clientName || ''),
        industry: String(item.clientIndustry || '')
      },
      technologies,
      images,
      demoUrl: String(item.demoUrl || ''),
      category: String(item.category || 'web') as PortfolioItem['category'],
      completedDate: completedDate.toISOString(),
      featured: Number(item.featured) === 1,
      isActive: Number(item.isActive) === 1
    };
    
    return NextResponse.json<ApiResponse>({ success: true, data: formattedData });
  } catch (error) {
    console.error('Failed to fetch portfolio item:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json<ApiResponse>(
      { success: false, error: `Failed to fetch portfolio item: ${errorMessage}` },
      { status: 500 }
    );
  }
}

// PUT - Update portfolio item
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const resolvedParams = await params;
    const id = resolvedParams.id;
    
    if (!id) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'ID is required' },
        { status: 400 }
      );
    }
    
    const connection = await mysql.createConnection(dbConfig);
    
    // Check if item exists
    const [checkRows] = await connection.execute(
      'SELECT id FROM PortfolioItem WHERE id = ?',
      [id]
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const checkItems = checkRows as any[];
    
    if (checkItems.length === 0) {
      await connection.end();
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Portfolio item not found' },
        { status: 404 }
      );
    }
    
    // Update the item
    await connection.execute(
      `UPDATE PortfolioItem 
       SET titleTh = ?, titleEn = ?, descriptionTh = ?, descriptionEn = ?,
           clientName = ?, clientIndustry = ?, technologies = ?, images = ?,
           demoUrl = ?, category = ?, completedDate = ?, featured = ?, isActive = ?, updatedAt = NOW()
       WHERE id = ?`,
      [
        body.title?.th || '',
        body.title?.en || '',
        body.description?.th || '',
        body.description?.en || '',
        body.client?.name || '',
        body.client?.industry || '',
        (body.technologies || []).join(','),
        (body.images || [])[0] || '/images/portfolio/placeholder-1.jpg',
        body.demoUrl || '',
        body.category || 'web',
        body.completedDate ? new Date(body.completedDate) : new Date(),
        body.featured ? 1 : 0,
        body.isActive !== false ? 1 : 0,
        id
      ]
    );
    
    await connection.end();
    
    return NextResponse.json<ApiResponse>({ success: true, message: 'Portfolio item updated successfully' });
  } catch (error) {
    console.error('Failed to update portfolio item:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to update portfolio item' },
      { status: 500 }
    );
  }
}

// PATCH - Update portfolio item status (partial update)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const resolvedParams = await params;
    const id = resolvedParams.id;
    
    if (!id) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'ID is required' },
        { status: 400 }
      );
    }
    
    const connection = await mysql.createConnection(dbConfig);
    
    // Check if item exists
    const [checkRows] = await connection.execute(
      'SELECT id FROM PortfolioItem WHERE id = ?',
      [id]
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const checkItems = checkRows as any[];
    
    if (checkItems.length === 0) {
      await connection.end();
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Portfolio item not found' },
        { status: 404 }
      );
    }
    
    // Build dynamic update query
    const updateFields: string[] = [];
    const updateValues: (string | number | boolean)[] = [];

    // Boolean fields
    if (typeof body.isActive === 'boolean') {
      updateFields.push('isActive = ?');
      updateValues.push(body.isActive ? 1 : 0);
    }

    if (typeof body.featured === 'boolean') {
      updateFields.push('featured = ?');
      updateValues.push(body.featured ? 1 : 0);
    }

    // Nested object fields (title, description, client)
    if (body.title?.th !== undefined) {
      updateFields.push('titleTh = ?');
      updateValues.push(String(body.title.th));
    }

    if (body.title?.en !== undefined) {
      updateFields.push('titleEn = ?');
      updateValues.push(String(body.title.en));
    }

    if (body.description?.th !== undefined) {
      updateFields.push('descriptionTh = ?');
      updateValues.push(String(body.description.th));
    }

    if (body.description?.en !== undefined) {
      updateFields.push('descriptionEn = ?');
      updateValues.push(String(body.description.en));
    }

    if (body.client?.name !== undefined) {
      updateFields.push('clientName = ?');
      updateValues.push(String(body.client.name));
    }

    if (body.client?.industry !== undefined) {
      updateFields.push('clientIndustry = ?');
      updateValues.push(String(body.client.industry));
    }

    // Direct fields
    if (body.technologies !== undefined) {
      updateFields.push('technologies = ?');
      updateValues.push(Array.isArray(body.technologies) ? body.technologies.join(',') : String(body.technologies));
    }

    if (body.images !== undefined) {
      updateFields.push('images = ?');
      updateValues.push(Array.isArray(body.images) ? body.images[0] || '' : String(body.images));
    }

    if (body.demoUrl !== undefined) {
      updateFields.push('demoUrl = ?');
      updateValues.push(String(body.demoUrl));
    }

    if (body.category !== undefined) {
      updateFields.push('category = ?');
      updateValues.push(String(body.category));
    }

    if (body.completedDate !== undefined) {
      updateFields.push('completedDate = ?');
      updateValues.push(new Date(body.completedDate).toISOString());
    }

    if (updateFields.length === 0) {
      await connection.end();
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'No valid fields to update' },
        { status: 400 }
      );
    }
    
    // Add updatedAt and id to values
    updateFields.push('updatedAt = NOW()');
    updateValues.push(id);
    
    await connection.execute(
      `UPDATE PortfolioItem SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );
    
    await connection.end();
    
    return NextResponse.json<ApiResponse>({ 
      success: true, 
      message: 'Portfolio item updated successfully' 
    });
  } catch (error) {
    console.error('Failed to update portfolio item:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to update portfolio item' },
      { status: 500 }
    );
  }
}

// DELETE - Remove portfolio item
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;
    
    if (!id) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'ID is required' },
        { status: 400 }
      );
    }
    
    const connection = await mysql.createConnection(dbConfig);
    
    // Check if item exists
    const [checkRows] = await connection.execute(
      'SELECT id FROM PortfolioItem WHERE id = ?',
      [id]
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const checkItems = checkRows as any[];
    
    if (checkItems.length === 0) {
      await connection.end();
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Portfolio item not found' },
        { status: 404 }
      );
    }
    
    // Delete the item
    await connection.execute(
      'DELETE FROM PortfolioItem WHERE id = ?',
      [id]
    );
    
    await connection.end();
    
    return NextResponse.json<ApiResponse>({ 
      success: true, 
      message: 'Portfolio item deleted successfully' 
    });
  } catch (error) {
    console.error('Failed to delete portfolio item:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to delete portfolio item' },
      { status: 500 }
    );
  }
}
