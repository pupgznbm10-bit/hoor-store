import bcrypt from 'bcryptjs';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import fs from 'fs/promises';
import path from 'path';
import type { NextRequest } from 'next/server';

export type UserRecord = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  city?: string;
  address?: string;
  passwordHash: string;
  createdAt: string;
  isVerified?: boolean;
};

export type SafeUser = Omit<UserRecord, 'passwordHash'>;

const DATA_FILE = path.join(process.cwd(), 'src', 'data', 'users.json');
const JWT_SECRET = process.env.JWT_SECRET || 'hoor-store-dev-secret-change-me';
const AUTH_COOKIE_NAME = 'hoor_token';
export const ADMIN_EMAIL = 'mw01551687704@gmail.com';

export function isAdminEmail(email?: string | null) {
  return !!email && email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase();
}

async function ensureDataFile() {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(DATA_FILE, '[]', 'utf-8');
  }
}

export async function readUsers(): Promise<UserRecord[]> {
  await ensureDataFile();
  const raw = await fs.readFile(DATA_FILE, 'utf-8');
  const cleaned = raw.replace(/^\uFEFF/, '');
  const parsed = cleaned ? JSON.parse(cleaned) : [];
  return Array.isArray(parsed) ? parsed : [];
}

export async function writeUsers(users: UserRecord[]) {
  await ensureDataFile();
  await fs.writeFile(DATA_FILE, JSON.stringify(users, null, 2), 'utf-8');
}

export function sanitizeUser(user: UserRecord): SafeUser {
  const { passwordHash, ...safeUser } = user;
  return safeUser;
}

export async function findUserByEmail(email: string) {
  const normalized = email.trim().toLowerCase();
  const users = await readUsers();
  return users.find((user) => user.email.toLowerCase() === normalized) ?? null;
}

export async function findUserById(id: string) {
  const users = await readUsers();
  return users.find((user) => user.id === id) ?? null;
}

export async function createUserRecord(input: {
  fullName: string;
  email: string;
  phone: string;
  city?: string;
  address?: string;
  password: string;
}) {
  const fullName = input.fullName.trim();
  const email = input.email.trim().toLowerCase();
  const phone = input.phone.trim();
  const city = String(input.city || '').trim();
  const address = String(input.address || '').trim();

  if (!fullName || !email || !phone || !input.password) {
    throw new Error('All fields are required.');
  }

  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    throw new Error('User already exists.');
  }

  const passwordHash = await bcrypt.hash(input.password, 10);
  const newUser: UserRecord = {
    id: `u_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    fullName,
    email,
    phone,
    city: city || undefined,
    address: address || undefined,
    passwordHash,
    createdAt: new Date().toISOString(),
    isVerified: false,
  };

  const users = await readUsers();
  users.push(newUser);
  await writeUsers(users);

  return sanitizeUser(newUser);
}

export async function verifyCredentials(email: string, password: string) {
  const user = await findUserByEmail(email);
  if (!user) return null;

  // require email to be verified before allowing login
  if (!user.isVerified) return null;

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) return null;

  return sanitizeUser(user);
}

export async function updateUserPassword(userId: string, newPassword: string) {
  const users = await readUsers();
  const index = users.findIndex((u) => u.id === userId);
  if (index === -1) return null;

  const passwordHash = await bcrypt.hash(newPassword, 10);
  users[index] = { ...users[index], passwordHash };
  await writeUsers(users);
  return sanitizeUser(users[index]);
}

export async function updateUserProfile(userId: string, updates: { fullName?: string; phone?: string; city?: string; address?: string }) {
  const users = await readUsers();
  const index = users.findIndex((u) => u.id === userId);
  if (index === -1) return null;

  const user = users[index];
  const newUser = { ...user } as UserRecord;
  if (updates.fullName !== undefined) newUser.fullName = String(updates.fullName).trim();
  if (updates.phone !== undefined) newUser.phone = String(updates.phone).trim();
  if (updates.city !== undefined) newUser.city = String(updates.city).trim() || undefined;
  if (updates.address !== undefined) newUser.address = String(updates.address).trim() || undefined;

  users[index] = newUser;
  await writeUsers(users);
  return sanitizeUser(newUser);
}

export function signSessionToken(user: SafeUser) {
  return jwt.sign(
    { sub: user.id, email: user.email, fullName: user.fullName },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function verifySessionToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch {
    return null;
  }
}

export async function getCurrentUserFromRequest(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (!token) return null;

  const payload = verifySessionToken(token);
  if (!payload || !payload.sub) return null;

  const user = await findUserById(String(payload.sub));
  if (!user) return null;

  return sanitizeUser(user);
}

export function authCookieOptions() {
  return {
    name: AUTH_COOKIE_NAME,
    value: '',
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  };
}
