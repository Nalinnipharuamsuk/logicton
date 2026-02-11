import { Resend } from 'resend';

interface SendMessageOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

// ==================== EMAIL NOTIFICATIONS ====================
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

async function sendEmailNotification({ to, subject, html, text }: SendMessageOptions) {
  // If Resend is not configured, log the email instead
  if (!resend || !process.env.RESEND_API_KEY) {
    console.log('Email service not configured. Email would be sent:', {
      to,
      subject,
      html,
      text
    });
    return { success: true, message: 'Email logged (service not configured)' };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'noreply@logicton.com',
      to,
      subject,
      html,
      text,
    });

    if (error) {
      console.error('Resend error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, error: 'Failed to send email' };
  }
}

// ==================== SLACK NOTIFICATIONS ====================
async function sendSlackNotification(message: string): Promise<{ success: boolean; error?: string }> {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;

  if (!webhookUrl || webhookUrl === 'your_slack_webhook_url_here') {
    console.log('Slack not configured. Message would be sent:', message);
    return { success: true };
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: message,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Slack error:', errorText);
      return { success: false, error: errorText };
    }

    return { success: true };
  } catch (error) {
    console.error('Slack sending error:', error);
    return { success: false, error: 'Failed to send Slack notification' };
  }
}

// ==================== MAIN SEND FUNCTION ====================
export async function sendNotification({
  type = 'slack', // 'slack' or 'email'
  to,
  subject,
  html,
  text,
  message,
}: {
  type?: 'slack' | 'email';
  to?: string;
  subject?: string;
  html?: string;
  text?: string;
  message?: string;
}) {
  if (type === 'slack') {
    if (!message) {
      return { success: false, error: 'Message is required for Slack' };
    }
    return await sendSlackNotification(message);
  } else {
    if (!to || !subject) {
      return { success: false, error: 'to, subject are required for email' };
    }
    return await sendEmailNotification({
      to,
      subject,
      html: html || '',
      text: text || ''
    });
  }
}

export function generateContactMessageText(data: {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  subject: string;
  message: string;
  language: 'th' | 'en';
}): string {
  const isThai = data.language === 'th';

  const timestamp = new Date().toLocaleString(data.language === 'th' ? 'th-TH' : 'en-US');

  return `
📧 ${isThai ? 'ข้อความใหม่จากฟอร์มติดต่อ' : 'New Contact Form Message'}
─────────────────────────────

${isThai ? 'ชื่อ:' : 'Name'} ${data.name}
${isThai ? 'อีเมล:' : 'Email'} ${data.email}
${data.phone ? `${isThai ? 'โทรศัพท์:' : 'Phone'} ${data.phone}` : ''}
${data.company ? `${isThai ? 'บริษัท:' : 'Company'} ${data.company}` : ''}

${isThai ? 'หัวข้อ:' : 'Subject'} ${data.subject}

${isThai ? 'ข้อความ:' : 'Message'}
${data.message}

─────────────────────────────
${isThai ? 'ส่งมาจาก:' : 'Sent from'} Logicton Website
${timestamp}
  `.trim();
}

export function generateContactEmailHTML(data: {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  subject: string;
  message: string;
  language: 'th' | 'en';
}) {
  const isThai = data.language === 'th';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${isThai ? 'ข้อความใหม่จากฟอร์มติดต่อ' : 'New Contact Form Message'}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .field { margin-bottom: 15px; }
        .label { font-weight: bold; color: #667eea; margin-bottom: 5px; }
        .value { background: white; padding: 10px; border-radius: 5px; border-left: 4px solid #667eea; }
        .message-box { background: #fffbeb; padding: 15px; border-radius: 5px; border-left: 4px solid #f59e0b; margin-top: 20px; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${isThai ? '📧 ข้อความใหม่จากฟอร์มติดต่อ' : '📧 New Contact Form Message'}</h1>
      </div>
      <div class="content">
        <div class="field">
          <div class="label">${isThai ? 'ชื่อ:' : 'Name:'}</div>
          <div class="value">${data.name}</div>
        </div>
        <div class="field">
          <div class="label">${isThai ? 'อีเมล:' : 'Email:'}</div>
          <div class="value">${data.email}</div>
        </div>
        ${data.phone ? `
        <div class="field">
          <div class="label">${isThai ? 'โทรศัพท์:' : 'Phone:'}</div>
          <div class="value">${data.phone}</div>
        </div>
        ` : ''}
        ${data.company ? `
        <div class="field">
          <div class="label">${isThai ? 'บริษัท:' : 'Company:'}</div>
          <div class="value">${data.company}</div>
        </div>
        ` : ''}
        <div class="field">
          <div class="label">${isThai ? 'หัวข้อ:' : 'Subject:'}</div>
          <div class="value">${data.subject}</div>
        </div>
        <div class="message-box">
          <div class="label">${isThai ? 'ข้อความ:' : 'Message:'}</div>
          <div class="value" style="white-space: pre-wrap;">${data.message}</div>
        </div>
      </div>
      <div class="footer">
        <p>${isThai ? 'ข้อความนี้ถูกส่งจากฟอร์มติดต่อที่เว็บไซต์ของคุณ' : 'This message was sent from your website contact form'}</p>
        <p>${new Date().toLocaleString(data.language === 'th' ? 'th-TH' : 'en-US')}</p>
      </div>
    </body>
    </html>
  `;
}
