CREATE TYPE "public"."account_type" AS ENUM('CASH', 'BANK', 'CREDIT_CARD', 'MOBILE_WALLET', 'INVESTMENT', 'OTHER');--> statement-breakpoint
ALTER TABLE "accounts" DROP CONSTRAINT "accounts_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "accounts" ALTER COLUMN "type" SET DEFAULT 'CASH'::"public"."account_type";--> statement-breakpoint
ALTER TABLE "accounts" ALTER COLUMN "type" SET DATA TYPE "public"."account_type" USING "type"::"public"."account_type";--> statement-breakpoint
ALTER TABLE "accounts" ALTER COLUMN "currency" SET DATA TYPE varchar(3);--> statement-breakpoint
ALTER TABLE "accounts" ALTER COLUMN "currency" SET DEFAULT 'PKR';--> statement-breakpoint
ALTER TABLE "accounts" ALTER COLUMN "is_default" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "accounts" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "accounts" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "accounts" ALTER COLUMN "updated_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "accounts" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "updated_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "accounts" ADD COLUMN "icon" varchar(50);--> statement-breakpoint
ALTER TABLE "accounts" ADD COLUMN "is_active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "accounts" ADD COLUMN "archived_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "email" varchar(320) NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "first_name" varchar(100);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "last_name" varchar(100);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "image_url" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "is_active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "accounts_user_id_idx" ON "accounts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "accounts_user_active_idx" ON "accounts" USING btree ("user_id","is_active");--> statement-breakpoint
CREATE UNIQUE INDEX "accounts_user_id_name_unique_idx" ON "accounts" USING btree ("user_id","name");--> statement-breakpoint
CREATE UNIQUE INDEX "accounts_one_default_per_user_idx" ON "accounts" USING btree ("user_id") WHERE "accounts"."is_default" = true;--> statement-breakpoint
CREATE INDEX "users_is_active_idx" ON "users" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "users_deleted_at_idx" ON "users" USING btree ("deleted_at");--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_email_unique" UNIQUE("email");--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_currency_format_check" CHECK ("accounts"."currency" ~ '^[A-Z]{3}$');