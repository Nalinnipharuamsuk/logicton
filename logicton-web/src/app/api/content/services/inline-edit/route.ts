import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const dbConfig = {
  host: process.env.MYSQL_HOST || 'localhost',
  port: parseInt(process.env.MYSQL_PORT || '3306'),
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE
};

interface ServiceChange {
  serviceId: string;
  field: string;
  locale: 'th' | 'en';
  value: string | string[] | { title: string; description: string };
  index?: number;
}

export async function POST(request: NextRequest) {
  let connection;
  try {
    // 1. Strict Authentication & Authorization
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Role check (Admin only)
    if ((session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { changes } = body as { changes: ServiceChange[] };

    if (!changes || !Array.isArray(changes)) {
      return NextResponse.json({ success: false, error: 'Invalid changes data' }, { status: 400 });
    }

    // 2. Database Connection using Environment Variables
    if (!dbConfig.user || !dbConfig.password) {
      throw new Error('Database credentials not configured');
    }
    connection = await mysql.createConnection(dbConfig);

    try {
      // Group changes by service ID
      const changesByService: Map<string, ServiceChange[]> = new Map();
      changes.forEach(change => {
        if (!changesByService.has(change.serviceId)) {
          changesByService.set(change.serviceId, []);
        }
        changesByService.get(change.serviceId)!.push(change);
      });

      // Apply changes to each service in database
      for (const [serviceId, serviceChanges] of changesByService.entries()) {
        const [serviceRows] = await connection.execute('SELECT * FROM Service WHERE id = ?', [serviceId]) as [any[], any];

        if (serviceRows.length === 0) continue;

        const service = serviceRows[0];

        for (const change of serviceChanges) {
          const { field, locale, value, index } = change;

          // 3. Strict Input Validation (Prevent SQLi in column names)
          if (locale !== 'th' && locale !== 'en') {
            console.warn(`Invalid locale: ${locale}`);
            continue;
          }

          const suffix = locale === 'th' ? 'Th' : 'En';

          switch (field) {
            case 'title':
              await connection.execute(
                `UPDATE Service SET title${suffix} = ?, updatedAt = NOW() WHERE id = ?`,
                [String(value), serviceId]
              );
              break;

            case 'description':
              await connection.execute(
                `UPDATE Service SET description${suffix} = ?, updatedAt = NOW() WHERE id = ?`,
                [String(value), serviceId]
              );
              break;

            case 'features':
              const featuresKey = `features${suffix}`;
              const currentFeatures = service[featuresKey] ? (typeof service[featuresKey] === 'string' ? JSON.parse(service[featuresKey]) : service[featuresKey]) : [];

              if (typeof index === 'number') {
                // Update specific feature index in JSON array
                if (Array.isArray(currentFeatures)) {
                  currentFeatures[index] = value;
                  await connection.execute(
                    `UPDATE Service SET ${featuresKey} = ?, updatedAt = NOW() WHERE id = ?`,
                    [JSON.stringify(currentFeatures), serviceId]
                  );
                }
              } else if (Array.isArray(value)) {
                await connection.execute(
                  `UPDATE Service SET ${featuresKey} = ?, updatedAt = NOW() WHERE id = ?`,
                  [JSON.stringify(value), serviceId]
                );
              }
              break;

            case 'technologies':
              // Technologies is usually shared, or check schema. Assuming it's shared or simple JSON
              await connection.execute(
                `UPDATE Service SET technologies = ?, updatedAt = NOW() WHERE id = ?`,
                [JSON.stringify(value), serviceId]
              );
              break;

            case 'howWeWork':
              const howWeWorkKey = `howWeWork${suffix}`;
              const currentHowWeWork = service[howWeWorkKey] ? (typeof service[howWeWorkKey] === 'string' ? JSON.parse(service[howWeWorkKey]) : service[howWeWorkKey]) : [];

              if (typeof index === 'number') {
                // Update specific step
                if (Array.isArray(currentHowWeWork)) {
                  const stepValue = value as { title: string; description: string };
                  if (stepValue && typeof stepValue === 'object') {
                    currentHowWeWork[index] = stepValue;
                    await connection.execute(
                      `UPDATE Service SET ${howWeWorkKey} = ?, updatedAt = NOW() WHERE id = ?`,
                      [JSON.stringify(currentHowWeWork), serviceId]
                    );
                  }
                }
              }
              break;

            case 'icon':
              await connection.execute(
                `UPDATE Service SET icon = ?, updatedAt = NOW() WHERE id = ?`,
                [String(value), serviceId]
              );
              break;

            case 'category':
              await connection.execute(
                `UPDATE Service SET category = ?, updatedAt = NOW() WHERE id = ?`,
                [String(value), serviceId]
              );
              break;

            case 'order':
              const orderVal = Number(value);
              if (!isNaN(orderVal)) {
                await connection.execute(
                  `UPDATE Service SET \`order\` = ?, updatedAt = NOW() WHERE id = ?`,
                  [orderVal, serviceId]
                );
              }
              break;

            case 'isActive':
              const isActiveValue = value;
              await connection.execute(
                `UPDATE Service SET isActive = ?, updatedAt = NOW() WHERE id = ?`,
                [isActiveValue === true || isActiveValue === 'true' || isActiveValue === 1 ? 1 : 0, serviceId]
              );
              break;
          }
        }
      }

      return NextResponse.json({ success: true });
    } finally {
      if (connection) await connection.end();
    }
  } catch (error) {
    console.error('Service inline edit error:', error);
    return NextResponse.json({ success: false, error: 'Failed to save changes' }, { status: 500 });
  }
}
