import { db } from './index.ts';
import { books } from './schema.ts';
import { eq } from 'drizzle-orm';

export async function getAllBooks() {
  try {
    return await db.select().from(books).orderBy(books.id);
  } catch (error) {
    console.error('Database query failed for getAllBooks:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

export async function getBookById(id: number) {
  try {
    const res = await db.select().from(books).where(eq(books.id, id));
    return res[0] || null;
  } catch (error) {
    console.error(`Database query failed for getBookById(${id}):`, error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}
