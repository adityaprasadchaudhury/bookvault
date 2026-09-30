import { relations } from 'drizzle-orm';
import { integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

// Users table (PostgreSQL) linked with Firebase UID
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  email: text('email').notNull(),
  name: text('name'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Books table (PostgreSQL) storing curated monographs
export const books = pgTable('books', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  author: text('author').notNull(),
  description: text('description').notNull(),
  price: integer('price').notNull(),
  category: text('category').notNull(),
  pages: integer('pages').notNull(),
  isbn: text('isbn').notNull().unique(),
  coverImage: text('cover_image').notNull(),
  pdfFile: text('pdf_file').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Purchases table (PostgreSQL)
export const purchases = pgTable('purchases', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id)
    .notNull(),
  bookId: integer('book_id')
    .references(() => books.id)
    .notNull(),
  amount: integer('amount').notNull(),
  licenseKey: text('license_key').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  purchases: many(purchases),
}));

export const booksRelations = relations(books, ({ many }) => ({
  purchases: many(purchases),
}));

export const purchasesRelations = relations(purchases, ({ one }) => ({
  user: one(users, {
    fields: [purchases.userId],
    references: [users.id],
  }),
  book: one(books, {
    fields: [purchases.bookId],
    references: [books.id],
  }),
}));
