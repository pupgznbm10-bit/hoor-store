import fs from 'fs/promises';
import path from 'path';

export type OtpRecord = {
  email: string;
  code: string;
  expiresAt: number;
  createdAt: number;
};

const OTP_DATA_FILE = path.join(process.cwd(), 'src', 'data', 'otp.json');
const OTP_EXPIRY_MINUTES = 10; // expire after 10 minutes (match email text)

async function ensureOtpFile() {
  await fs.mkdir(path.dirname(OTP_DATA_FILE), { recursive: true });
  try {
    await fs.access(OTP_DATA_FILE);
  } catch {
    await fs.writeFile(OTP_DATA_FILE, '[]', 'utf-8');
  }
}

export async function readOtpRecords(): Promise<OtpRecord[]> {
  await ensureOtpFile();
  try {
    const raw = await fs.readFile(OTP_DATA_FILE, 'utf-8');
    const cleaned = raw.replace(/^\uFEFF/, '');
    const parsed = cleaned ? JSON.parse(cleaned) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function writeOtpRecords(records: OtpRecord[]) {
  await ensureOtpFile();
  await fs.writeFile(OTP_DATA_FILE, JSON.stringify(records, null, 2), 'utf-8');
}

export function generateOtpCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function createOtp(email: string, cooldownSeconds = 0): Promise<string> {
  const normalized = email.trim().toLowerCase();
  const now = Date.now();

  const records = await readOtpRecords();
  const existing = records.find((r) => r.email === normalized);

  if (existing && cooldownSeconds > 0) {
    const since = Math.max(0, now - existing.createdAt);
    if (since < cooldownSeconds * 1000) {
      const wait = Math.ceil((cooldownSeconds * 1000 - since) / 1000);
      throw new Error(`Cooldown: wait ${wait} seconds before resending`);
    }
  }

  const code = generateOtpCode();
  const expiresAt = now + OTP_EXPIRY_MINUTES * 60 * 1000;

  const filtered = records.filter((r) => r.email !== normalized);
  filtered.push({
    email: normalized,
    code,
    expiresAt,
    createdAt: now,
  });

  await writeOtpRecords(filtered);
  return code;
}

export async function verifyOtp(email: string, code: string): Promise<boolean> {
  const normalized = email.trim().toLowerCase();
  const records = await readOtpRecords();
  const record = records.find((r) => r.email === normalized);

  if (!record) return false;
  if (record.code !== code) return false;
  if (Date.now() > record.expiresAt) return false;

  return true;
}

export async function consumeOtp(email: string) {
  const normalized = email.trim().toLowerCase();
  const records = await readOtpRecords();
  const filtered = records.filter((r) => r.email !== normalized);
  await writeOtpRecords(filtered);
}
