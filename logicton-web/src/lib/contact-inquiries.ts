import fs from 'fs';
import path from 'path';
import { ContactInquiry } from '@/types';

// Define the content directory path
const CONTENT_DIR = path.join(process.cwd(), 'content');
const INQUIRIES_DIR = path.join(CONTENT_DIR, 'contact-inquiries');
const INQUIRIES_FILE = path.join(INQUIRIES_DIR, 'inquiries.json');

// Ensure directories exist
function ensureDirectories() {
  if (!fs.existsSync(CONTENT_DIR)) {
    fs.mkdirSync(CONTENT_DIR, { recursive: true });
  }
  if (!fs.existsSync(INQUIRIES_DIR)) {
    fs.mkdirSync(INQUIRIES_DIR, { recursive: true });
  }
}

// Read all contact inquiries
export async function getContactInquiries(): Promise<ContactInquiry[]> {
  try {
    ensureDirectories();

    if (!fs.existsSync(INQUIRIES_FILE)) {
      return [];
    }

    const data = fs.readFileSync(INQUIRIES_FILE, 'utf-8');
    const parsed = JSON.parse(data);

    // Sort by submittedAt descending (newest first)
    return parsed.sort((a: ContactInquiry, b: ContactInquiry) =>
      new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
    );
  } catch (error) {
    console.error('Error reading contact inquiries:', error);
    return [];
  }
}

// Save a new contact inquiry
export async function saveContactInquiry(inquiry: ContactInquiry): Promise<boolean> {
  try {
    ensureDirectories();

    const inquiries = await getContactInquiries();
    inquiries.push(inquiry);

    fs.writeFileSync(INQUIRIES_FILE, JSON.stringify(inquiries, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving contact inquiry:', error);
    return false;
  }
}

// Update inquiry status
export async function updateInquiryStatus(
  id: string,
  status: 'new' | 'read'
): Promise<boolean> {
  try {
    const inquiries = await getContactInquiries();
    const index = inquiries.findIndex(i => i.id === id);

    if (index === -1) {
      return false;
    }

    inquiries[index].status = status;
    fs.writeFileSync(INQUIRIES_FILE, JSON.stringify(inquiries, null, 2));
    return true;
  } catch (error) {
    console.error('Error updating inquiry status:', error);
    return false;
  }
}

// Delete an inquiry
export async function deleteInquiry(id: string): Promise<boolean> {
  try {
    const inquiries = await getContactInquiries();
    const filtered = inquiries.filter(i => i.id !== id);

    fs.writeFileSync(INQUIRIES_FILE, JSON.stringify(filtered, null, 2));
    return true;
  } catch (error) {
    console.error('Error deleting inquiry:', error);
    return false;
  }
}

// Get inquiry count by status
export async function getInquiryStats(): Promise<{
  total: number;
  new: number;
  read: number;
}> {
  try {
    const inquiries = await getContactInquiries();

    return {
      total: inquiries.length,
      new: inquiries.filter(i => i.status === 'new').length,
      read: inquiries.filter(i => i.status === 'read').length,
    };
  } catch (error) {
    console.error('Error getting inquiry stats:', error);
    return { total: 0, new: 0, read: 0 };
  }
}
