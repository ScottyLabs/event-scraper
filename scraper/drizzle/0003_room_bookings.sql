CREATE TABLE IF NOT EXISTS "room_bookings" (
	"id" serial PRIMARY KEY NOT NULL,
	"room" text NOT NULL,
	"start_time" timestamp NOT NULL,
	"end_time" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
