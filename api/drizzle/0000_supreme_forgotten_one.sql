CREATE TABLE "events" (
	"id" serial PRIMARY KEY NOT NULL,
	"context_id" integer NOT NULL,
	"item_id" integer NOT NULL,
	"name" text NOT NULL,
	"start_date" timestamp NOT NULL,
	"start_time" timestamp NOT NULL,
	"state" text NOT NULL,
	"locations" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "events_context_id_unique" UNIQUE("context_id")
);
