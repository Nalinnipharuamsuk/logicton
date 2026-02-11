import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'myuser',
  password: 'mypassword',
  database: 'mydatabase',
};

interface ServiceChange {
  serviceId: string;
  field: string;
  locale: 'th' | 'en';
  value: string | string[] | { title: string; description: string };
  index?: number;
}

export async function POST(request: NextRequest) {
  try {
    const { changes }: { changes: ServiceChange[] } = await request.json();

    if (!changes || !Array.isArray(changes)) {
      return NextResponse.json({ success: false, error: 'Invalid changes data' }, { status: 400 });
    }

    const connection = await mysql.createConnection(dbConfig);

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

          switch (field) {
            case 'title':
              await connection.execute(
                `UPDATE Service SET title${locale === 'th' ? 'Th' : 'En'} = ?, updatedAt = NOW() WHERE id = ?`,
                [value, serviceId]
              );
              break;

            case 'description':
              await connection.execute(
                `UPDATE Service SET description${locale === 'th' ? 'Th' : 'En'} = ?, updatedAt = NOW() WHERE id = ?`,
                [value, serviceId]
              );
              break;

            case 'features':
              const featuresKey = `features${locale === 'th' ? 'Th' : 'En'}`;
              if (typeof index === 'number') {
                // Update specific feature index in JSON array
                const currentFeatures = service[featuresKey] || [];
                currentFeatures[index] = value;
                await connection.execute(
                  `UPDATE Service SET ${featuresKey} = ?, updatedAt = NOW() WHERE id = ?`,
                  [JSON.stringify(currentFeatures), serviceId]
                );
              } else if (Array.isArray(value)) {
                await connection.execute(
                  `UPDATE Service SET ${featuresKey} = ?, updatedAt = NOW() WHERE id = ?`,
                  [JSON.stringify(value), serviceId]
                );
              }
              break;

            case 'technologies':
              await connection.execute(
                `UPDATE Service SET technologies = ?, updatedAt = NOW() WHERE id = ?`,
                [JSON.stringify(value), serviceId]
              );
              break;

            case 'howWeWork':
              const howWeWorkKey = `howWeWork${locale === 'th' ? 'Th' : 'En'}`;
              if (typeof index === 'number') {
                // Update specific step in howWeWork array
                const currentHowWeWork = service[howWeWorkKey] || [];
                const stepValue = value as { title: string; description: string };
                if (stepValue && typeof stepValue === 'object' && stepValue.title && stepValue.description) {
                  currentHowWeWork[index] = stepValue;
                }
                await connection.execute(
                  `UPDATE Service SET ${howWeWorkKey} = ?, updatedAt = NOW() WHERE id = ?`,
                  [JSON.stringify(currentHowWeWork), serviceId]
                );
              }
              break;

            case 'icon':
              await connection.execute(
                `UPDATE Service SET icon = ?, updatedAt = NOW() WHERE id = ?`,
                [value, serviceId]
              );
              break;

            case 'category':
              await connection.execute(
                `UPDATE Service SET category = ?, updatedAt = NOW() WHERE id = ?`,
                [value, serviceId]
              );
              break;

            case 'order':
              await connection.execute(
                `UPDATE Service SET \`order\` = ?, updatedAt = NOW() WHERE id = ?`,
                [value, serviceId]
              );
              break;

            case 'isActive':
              const isActiveValue = value as string | boolean;
              await connection.execute(
                `UPDATE Service SET isActive = ?, updatedAt = NOW() WHERE id = ?`,
                [isActiveValue === true || isActiveValue === 'true' ? 1 : 0, serviceId]
              );
              break;
          }
        }
      }

      return NextResponse.json({ success: true });
    } finally {
      await connection.end();
    }
  } catch (error) {
    console.error('Service inline edit error:', error);
    return NextResponse.json({ success: false, error: 'Failed to save changes' }, { status: 500 });
  }
}
