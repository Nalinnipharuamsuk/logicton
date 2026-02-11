import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Use environment variables for DB config
const dbConfig = {
  host: process.env.MYSQL_HOST || 'localhost',
  port: parseInt(process.env.MYSQL_PORT || '3306'),
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE
};

export async function GET() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute(
      'SELECT * FROM PortfolioItem ORDER BY completedDate DESC'
    );
    await connection.end();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = rows as any[];

    // Format data to match expected structure
    const formattedData = data.map(item => ({
      id: item.id,
      title: {
        th: item.titleTh,
        en: item.titleEn
      },
      description: {
        th: item.descriptionTh,
        en: item.descriptionEn
      },
      client: {
        name: item.clientName,
        industry: item.clientIndustry
      },
      technologies: item.technologies.split(','),
      images: [item.images],
      demoUrl: item.demoUrl,
      category: item.category,
      completedDate: item.completedDate.toISOString(),
      featured: item.featured,
      isActive: item.isActive
    }));

    return NextResponse.json({ success: true, data: formattedData }, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
      }
    });
  } catch (error) {
    console.error('Failed to fetch portfolio items:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch portfolio content' },
      { status: 500 }
    );
  }
}

// POST - Create new portfolio item
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Validate required fields
    if (!body.title || !body.title.en || !body.title.th || !body.client) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const connection = await mysql.createConnection(dbConfig);
    const id = `portfolio_${Date.now()}`;
    await connection.execute(
      `INSERT INTO PortfolioItem (id, titleTh, titleEn, descriptionTh, descriptionEn, clientName, clientIndustry, technologies, images, demoUrl, category, completedDate, featured, isActive, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        id,
        body.title.th,
        body.title.en,
        body.description?.th || '',
        body.description?.en || '',
        body.client.name,
        body.client.industry,
        (body.technologies || []).join(','),
        (body.images || [])[0] || '/images/portfolio/placeholder-1.jpg',
        body.demoUrl,
        body.category || 'web',
        body.completedDate ? new Date(body.completedDate) : new Date(),
        body.featured || 1,
        body.isActive !== false ? 1 : 0
      ]
    );
    await connection.end();

    return NextResponse.json({ success: true, data: { id } }, { status: 201 });
  } catch (error) {
    console.error('Failed to create portfolio item:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create portfolio item' },
      { status: 500 }
    );
  }
}

