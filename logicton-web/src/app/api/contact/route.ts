import { NextResponse } from 'next/server';
import { contactPayloadSchema } from '@/lib/validation';
import { generateId } from '@/lib/content';
import { sendNotification, generateContactMessageText, generateContactEmailHTML } from '@/lib/notifications';
import { saveContactInquiry } from '@/lib/contact-inquiries';
import type { ApiResponse, ContactInquiry } from '@/types';
import { headers } from 'next/headers';

// Simple in-memory rate limit store
// Map<IP, { count: number, resetTime: number }>
const rateLimit = new Map<string, { count: number, resetTime: number }>();
const WINDOW_SIZE_MS = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS = 5; // 5 requests per window

export async function POST(request: Request) {
  try {
    // 1. IP Detection (Safe Parsing)
    const headersList = await headers();
    let ip = headersList.get('x-real-ip') || 'unknown';

    // If behind a proxy, usage of x-forwarded-for should be cautious.
    // Ideally, we trust the first IP if we are behind a known proxy, but here we'll take the first non-private one or just the first one if we assume a standard setup.
    // For this implementation, we will prioritize X-Real-IP if set by our ingress, else fallback to the *first* IP in X-Forwarded-For to avoid spoofing if the proxy appends.
    const forwardedFor = headersList.get('x-forwarded-for');
    if (forwardedFor) {
      ip = forwardedFor.split(',')[0].trim();
    }

    // 2. Rate Limiting
    if (ip !== 'unknown') {
      const now = Date.now();
      const record = rateLimit.get(ip);

      if (record) {
        if (now > record.resetTime) {
          // Reset expired window
          rateLimit.set(ip, { count: 1, resetTime: now + WINDOW_SIZE_MS });
        } else {
          // Check limit
          if (record.count >= MAX_REQUESTS) {
            return NextResponse.json<ApiResponse>(
              { success: false, error: 'Too many requests. Please try again later.' },
              { status: 429 }
            );
          }
          record.count++;
        }
      } else {
        // New record
        rateLimit.set(ip, { count: 1, resetTime: now + WINDOW_SIZE_MS });
      }
    }

    // Cleanup old rate limit entries periodically (could be optimized, but ok for simple implementation)
    if (Math.random() < 0.01) { // 1% chance to cleanup
      const now = Date.now();
      for (const [key, val] of rateLimit.entries()) {
        if (now > val.resetTime) rateLimit.delete(key);
      }
    }

    const body = await request.json();

    // Validate payload
    const validationResult = contactPayloadSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Invalid form data', message: 'Please check your input fields' },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Create contact inquiry record
    const inquiry: ContactInquiry = {
      id: generateId('inquiry'),
      name: data.name,
      email: data.email,
      phone: data.phone,
      company: data.company,
      subject: data.subject,
      message: data.message,
      language: data.language,
      submittedAt: new Date().toISOString(),
      status: 'new',
      ipAddress: ip
    };

    // Save inquiry to storage
    await saveContactInquiry(inquiry);

    // Generate email content
    const emailHTML = generateContactEmailHTML({
      name: inquiry.name,
      email: inquiry.email,
      phone: inquiry.phone,
      company: inquiry.company,
      subject: inquiry.subject,
      message: inquiry.message,
      language: inquiry.language,
    });

    const emailText = generateContactMessageText({
      name: inquiry.name,
      email: inquiry.email,
      phone: inquiry.phone,
      company: inquiry.company,
      subject: inquiry.subject,
      message: inquiry.message,
      language: inquiry.language,
    });

    // Send email and Slack notifications simultaneously
    const [emailResult, slackResult] = await Promise.all([
      // Email notification
      sendNotification({
        type: 'email',
        to: process.env.EMAIL_TO || 'din254339@gmail.com',
        subject: `${inquiry.language === 'th' ? 'ข้อความใหม่จากฟอร์มติดตอ' : 'New Contact Form Message'}: ${inquiry.subject}`,
        html: emailHTML,
        text: emailText,
      }),
      // Slack notification
      sendNotification({
        type: 'slack',
        message: emailText,
      }),
    ]);

    // Log results (don't fail the request if notifications fail)
    if (!emailResult.success) {
      console.error('Failed to send email notification:', emailResult.error);
    }
    if (!slackResult.success) {
      console.error('Failed to send Slack notification:', slackResult.error);
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Contact form submitted successfully',
      data: { id: inquiry.id }
    });
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to submit contact form' },
      { status: 500 }
    );
  }
}
