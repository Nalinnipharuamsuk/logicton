import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  port: 3306,
  user: 'myuser',
  password: 'mypassword',
  database: 'mydatabase'
};

interface InlineEditChange {
  path: string;
  value: string;
  locale: 'th' | 'en';
}

export async function POST(request: Request) {
  let connection;
  try {
    const { changes }: { changes: InlineEditChange[] } = await request.json();

    if (!changes || changes.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No changes provided' },
        { status: 400 }
      );
    }

    connection = await mysql.createConnection(dbConfig);

    // Process each change
    for (const change of changes) {
      const { path, value, locale } = change;

      // Parse the path to determine what type of content it is
      // Format: {page}.{section}.{field}
      // e.g., 'home.hero.title', 'about.description'

      const parts = path.split('.');
      if (parts.length < 2) continue;

      const [page, section, field] = parts;

      // Check if this content already exists
      const [existing] = await connection.execute(
        'SELECT * FROM InlineEditableContent WHERE page = ? AND section = ? AND field = ? AND locale = ?',
        [page, section, field, locale]
      );

      if (Array.isArray(existing) && existing.length > 0) {
        // Update existing content
        await connection.execute(
          'UPDATE InlineEditableContent SET value = ?, updatedAt = NOW() WHERE page = ? AND section = ? AND field = ? AND locale = ?',
          [value, page, section, field, locale]
        );
      } else {
        // Insert new content (let database auto-generate id)
        await connection.execute(
          'INSERT INTO InlineEditableContent (page, section, field, locale, value, isActive, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, 1, NOW(), NOW())',
          [page, section, field, locale, value]
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: `Saved ${changes.length} change(s) successfully`,
    });
  } catch (error) {
    console.error('Failed to save inline edits:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save changes' },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

export async function GET(request: Request) {
  let connection;
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page');
    const locale = searchParams.get('locale') || 'en';

    if (!page) {
      return NextResponse.json(
        { success: false, error: 'Page parameter is required' },
        { status: 400 }
      );
    }

    connection = await mysql.createConnection(dbConfig);

    const [rows] = await connection.execute(
      'SELECT * FROM InlineEditableContent WHERE page = ? AND locale = ? AND isActive = 1',
      [page, locale]
    );

    // Convert to a map of path -> value
    const contentMap: Record<string, string> = {};
    if (Array.isArray(rows)) {
      for (const row of rows as any[]) {
        const path = `${row.page}.${row.section}.${row.field}`;
        contentMap[path] = row.value;
      }
    }

    return NextResponse.json({
      success: true,
      data: contentMap,
    });
  } catch (error) {
    console.error('Failed to fetch inline editable content:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch content' },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}
