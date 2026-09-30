import { db } from './index.ts';
import { users, purchases } from './schema.ts';
import { eq, and } from 'drizzle-orm';

export async function getOrCreateUser(uid: string, email: string, name?: string) {
  try {
    const result = await db
      .insert(users)
      .values({
        uid,
        email,
        name: name || null,
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          email,
          ...(name ? { name } : {}),
        },
      })
      .returning();

    return result[0];
  } catch (error) {
    console.error('Database query failed for getOrCreateUser:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

export async function recordPurchase(userId: number, bookId: number, amount: number, licenseKey: string) {
  try {
    const result = await db
      .insert(purchases)
      .values({
        userId,
        bookId,
        amount,
        licenseKey,
      })
      .returning();

    return result[0];
  } catch (error) {
    console.error('Database query failed for recordPurchase:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

export async function getUserPurchases(userId: number) {
  try {
    return await db.select().from(purchases).where(eq(purchases.userId, userId));
  } catch (error) {
    console.error('Database query failed for getUserPurchases:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}
