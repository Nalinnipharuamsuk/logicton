import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, unlink, rm } from 'fs/promises';
import { join, normalize, resolve } from 'path';
import { existsSync } from 'fs';
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

export async function POST(request: NextRequest) {
  let connection;
  try {
    // 1. Require Authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const path = formData.get('path') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // 2. Strict File Type Whitelist & Magic Bytes Validation
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Only JPG, PNG, and WebP are allowed.' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    if (!validateMagicBytes(buffer, file.type)) {
      return NextResponse.json({ error: 'File content does not match extension' }, { status: 400 });
    }

    // 3. Sanitize Folder and Path
    let folder = 'general';
    if (path) {
      const pathParts = path.split('.');
      if (pathParts.length >= 1) {
        // Sanitize: allow only alphanumeric and underscores
        folder = pathParts[0].replace(/[^a-zA-Z0-9_]/g, ''); 
      }
    }
    // Default fallback if sanitization leaves empty string
    if (!folder) folder = 'general';

    // 4. Prevent Path Traversal & Write Outside Directory
    const uploadBaseDir = join(process.cwd(), 'public', 'images');
    const uploadDir = join(uploadBaseDir, folder);
    
    // Ensure the resolved path is inside the base directory
    const resolvedPath = resolve(uploadDir);
    if (!resolvedPath.startsWith(resolve(uploadBaseDir))) {
        return NextResponse.json({ error: 'Invalid upload path' }, { status: 400 });
    }

    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Generate safe filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    // Explicitly map allowed types to extensions
    const mimeToExt: Record<string, string> = {
        'image/jpeg': 'jpg',
        'image/png': 'png',
        'image/webp': 'webp'
    };
    const extension = mimeToExt[file.type]; 
    const filename = `img_${timestamp}_${randomString}.${extension}`;

    const filepath = join(uploadDir, filename);
    await writeFile(filepath, buffer);

    const publicPath = `/images/${folder}/${filename}`;

    // 5. Delete old image (Safe handling)
    if (path) {
        // ... (Existing deletion logic but safeguarded)
        // For brevity in this critical patch, we'll keep the logic but wrap it carefully
        // Ideally DB operations should also use parameterized queries (which they do below)
         try {
            if (!dbConfig.user || !dbConfig.password) {
                 console.warn("Skipping DB update: Missing DB credentials");
            } else {
                connection = await mysql.createConnection(dbConfig);
                const pathParts = path.split('.');
                if (pathParts.length >= 3) {
                    const [page, section, field] = pathParts;
                     // Input validation for SQL parameters is handled by parameterized query
                    const [rows] = await connection.execute(
                        'SELECT value FROM InlineEditableContent WHERE page = ? AND section = ? AND field = ?',
                        [page, section, field]
                    );
                    
                    if (Array.isArray(rows) && rows.length > 0) {
                        const oldImagePath = (rows as any[])[0].value;
                        if (oldImagePath && oldImagePath.startsWith('/images/')) {
                            // Validate old image path is within public/images
                             const normalizedOldPath = normalize(join(process.cwd(), 'public', oldImagePath));
                             const publicImagesDir = resolve(join(process.cwd(), 'public', 'images'));
                             
                             if (normalizedOldPath.startsWith(publicImagesDir) && existsSync(normalizedOldPath)) {
                                 await unlink(normalizedOldPath).catch(err => console.warn("Failed to unlink old image", err));
                             }
                        }
                    }
                }
            }
         } catch (e) {
             console.warn("DB Cleanup failed", e);
         }
    }

    return NextResponse.json({
      success: true,
      url: publicPath,
      path: publicPath,
      filename
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

function validateMagicBytes(buffer: Buffer, mimeType: string): boolean {
    if (buffer.length < 4) return false;
    const hex = buffer.toString('hex', 0, 4).toUpperCase();
    
    // JPEG: FF D8 FF
    if (mimeType === 'image/jpeg') return hex.startsWith('FFD8FF');
    
    // PNG: 89 50 4E 47
    if (mimeType === 'image/png') return hex === '89504E47';
    
    // WebP: 52 49 46 46 (RIFF) ... 57 45 42 50 (WEBP)
    // Need to check more bytes for WebP
    if (mimeType === 'image/webp') {
        if (buffer.length < 12) return false;
        const riff = buffer.toString('ascii', 0, 4);
        const webp = buffer.toString('ascii', 8, 12);
        return riff === 'RIFF' && webp === 'WEBP';
    }
    
    return false;
}
