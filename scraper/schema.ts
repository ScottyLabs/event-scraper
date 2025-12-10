import { pgTable, serial, text, timestamp, integer } from 'drizzle-orm/pg-core';

export const events = pgTable('events', {
  id: serial('id').primaryKey(),
  eventId: integer('event_id').notNull(),
  itemId2: integer('item_id2').notNull().unique(),
  name: text('name').notNull(),
  profileName: text('profile_name'),
  startDateTime: timestamp('start_date_time').notNull(),
  endDateTime: timestamp('end_date_time').notNull(),
  locations: text('locations').notNull(), // JSON string of location names
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const roomBookings = pgTable('room_bookings', {
  id: serial('id').primaryKey(),
  room: text('room').notNull(),
  startTime: timestamp('start_time').notNull(),
  endTime: timestamp('end_time').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;
export type RoomBooking = typeof roomBookings.$inferSelect;
export type NewRoomBooking = typeof roomBookings.$inferInsert;
