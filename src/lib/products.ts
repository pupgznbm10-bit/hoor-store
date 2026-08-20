import fs from 'fs/promises';
import path from 'path';

export type Product = {
  id: string;
  name: string;
  brand?: string;
  category?: string;
  price?: number;
  discountPrice?: number;
  rating?: number;
  description?: string;
  fragranceFamily?: string;
  notes?: { [section: string]: string[] };
  tags?: string[];
  volumes?: string[];
  images?: string[];
  bestseller?: boolean;
};

const DATA_FILE = path.join(process.cwd(), 'src', 'data', 'products.json');

async function ensureDataFile() {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(DATA_FILE, '[]', 'utf-8');
  }
}

export async function readProducts(): Promise<Product[]> {
  await ensureDataFile();
  const raw = await fs.readFile(DATA_FILE, 'utf-8');
  const cleaned = raw.replace(/^\uFEFF/, '');
  const parsed = cleaned ? JSON.parse(cleaned) : [];
  return Array.isArray(parsed) ? parsed : [];
}

export async function writeProducts(products: Product[]) {
  await ensureDataFile();
  await fs.writeFile(DATA_FILE, JSON.stringify(products, null, 2), 'utf-8');
}

export function generateProductId(name?: string) {
  const base = (name || 'p').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  return `${base || 'p'}-${Date.now().toString(36).slice(-6)}`;
}

export async function createProduct(input: Partial<Product>) {
  const products = await readProducts();
  const id = input.id || generateProductId(input.name);
  const newProd: Product = {
    id,
    name: input.name || 'بدون اسم',
    brand: input.brand || 'Hoor',
    category: input.category || 'uncategorized',
    price: input.price || 0,
      discountPrice: typeof input.discountPrice === 'number' ? input.discountPrice : undefined,
      rating: input.rating || 0,
      description: input.description || '',
      fragranceFamily: input.fragranceFamily || '',
      notes: input.notes || {},
      tags: input.tags || [],
      volumes: input.volumes || [],
      images: input.images || [],
      bestseller: !!input.bestseller,
    };

  products.unshift(newProd);
  await writeProducts(products);
  return newProd;
}

export async function updateProduct(id: string, updates: Partial<Product>) {
  const products = await readProducts();
  const idx = products.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  const merged = { ...products[idx], ...updates, id };
  products[idx] = merged;
  await writeProducts(products);
  return merged;
}

export async function deleteProduct(id: string) {
  const products = await readProducts();
  const filtered = products.filter((p) => p.id !== id);
  await writeProducts(filtered);
  return true;
}
