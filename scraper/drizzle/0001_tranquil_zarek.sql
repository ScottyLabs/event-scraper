ALTER TABLE "events" RENAME COLUMN "context_id" TO "event_id";--> statement-breakpoint
ALTER TABLE "events" RENAME COLUMN "item_id" TO "item_id2";--> statement-breakpoint
ALTER TABLE "events" DROP CONSTRAINT "events_context_id_unique";--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "profile_name" text;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "start_date_time" timestamp NOT NULL;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "end_date_time" timestamp NOT NULL;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "all_day" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "has_registration" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "events" DROP COLUMN "start_date";--> statement-breakpoint
ALTER TABLE "events" DROP COLUMN "start_time";--> statement-breakpoint
ALTER TABLE "events" DROP COLUMN "state";--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_item_id2_unique" UNIQUE("item_id2");