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
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if ((session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { changes } = body as { changes: ServiceChange[] };

    if (!changes || !Array.isArray(changes)) {
      return NextResponse.json({ success: false, error: 'Invalid changes data' }, { status: 400 });
    }

    if (!dbConfig.user || !dbConfig.password) {
      throw new Error('Database credentials not configured');
    }

    connection = await mysql.createConnection(dbConfig);

    try {
      const changesByService: Map<string, ServiceChange[]> = new Map();

      changes.forEach(change => {
        if (!changesByService.has(change.serviceId)) {
          changesByService.set(change.serviceId, []);
        }
        changesByService.get(change.serviceId)!.push(change);
      });

      for (const [serviceId, serviceChanges] of changesByService.entries()) {
        const [serviceRows] = await connection.execute(
          'SELECT * FROM Service WHERE id = ?',
          [serviceId]
        ) as [any[], any];

        if (serviceRows.length === 0) continue;

        const service = serviceRows[0];

        for (const change of serviceChanges) {
          const { field, locale, value, index } = change;

          if (locale !== 'th' && locale !== 'en') continue;

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

            case 'features': {
              const key = `features${suffix}`;
              const current = service[key]
                ? (typeof service[key] === 'string' ? JSON.parse(service[key]) : service[key])
                : [];

              if (typeof index === 'number' && Array.isArray(current)) {
                current[index] = value;
                await connection.execute(
                  `UPDATE Service SET ${key} = ?, updatedAt = NOW() WHERE id = ?`,
                  [JSON.stringify(current), serviceId]
                );
              } else if (Array.isArray(value)) {
                await connection.execute(
                  `UPDATE Service SET ${key} = ?, updatedAt = NOW() WHERE id = ?`,
                  [JSON.stringify(value), serviceId]
                );
              }
              break;
            }

            case 'technologies':
              await connection.execute(
                `UPDATE Service SET technologies = ?, updatedAt = NOW() WHERE id = ?`,
                [JSON.stringify(value), serviceId]
              );
              break;

            case 'howWeWork': {
              const key = `howWeWork${suffix}`;
              const current = service[key]
                ? (typeof service[key] === 'string' ? JSON.parse(service[key]) : service[key])
                : [];

              if (typeof index === 'number' && Array.isArray(current)) {
                const stepValue = value as { title: string; description: string };
                current[index] = stepValue;
                await connection.execute(
                  `UPDATE Service SET ${key} = ?, updatedAt = NOW() WHERE id = ?`,
                  [JSON.stringify(current), serviceId]
                );
              }
              break;
            }

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

            case 'order': {
              const orderVal = Number(value);
              if (!isNaN(orderVal)) {
                await connection.execute(
                  `UPDATE Service SET \`order\` = ?, updatedAt = NOW() WHERE id = ?`,
                  [orderVal, serviceId]
                );
              }
              break;
            }

            case 'isActive': {
              const normalized =
                value === true ||
                value === 'true' ||
                value === '1' ||
                value === 1;

              await connection.execute(
                `UPDATE Service SET isActive = ?, updatedAt = NOW() WHERE id = ?`,
                [normalized ? 1 : 0, serviceId]
              );
              break;
            }
          }
        }
      }

      return NextResponse.json({ success: true });

    } finally {
      if (connection) await connection.end();
    }

  } catch (error) {
    console.error('Service inline edit error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save changes' },
      { status: 500 }
    );
  }
}
