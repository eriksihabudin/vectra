CREATE TABLE `account` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`account_id` text NOT NULL,
	`provider_id` text NOT NULL,
	`access_token` text,
	`refresh_token` text,
	`access_token_expires_at` integer,
	`refresh_token_expires_at` integer,
	`scope` text,
	`password` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_account_user_id` ON `account` (`user_id`);--> statement-breakpoint
CREATE TABLE `activity_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`action` text NOT NULL,
	`details` text,
	`ip_address` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `idx_activity_logs_user_id` ON `activity_logs` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_activity_logs_created_at` ON `activity_logs` (`created_at`);--> statement-breakpoint
CREATE TABLE `residents` (
	`id` text PRIMARY KEY NOT NULL,
	`nik` text(16) NOT NULL,
	`no_kk` text(16) NOT NULL,
	`no_hp` text(20) NOT NULL,
	`nama_lengkap` text(255) NOT NULL,
	`jenis_kelamin` text(20) NOT NULL,
	`agama` text(50) NOT NULL,
	`pekerjaan` text(100) NOT NULL,
	`rt` text(5) NOT NULL,
	`rw` text(5) NOT NULL,
	`unsur_pemilih` text(100) NOT NULL,
	`kategori` text(100) NOT NULL,
	`foto_ktp_path` text,
	`ocr_raw_text` text,
	`created_by_user_id` text,
	`telegram_chat_id` text,
	`telegram_sender_name` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`created_by_user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `residents_nik_unique` ON `residents` (`nik`);--> statement-breakpoint
CREATE UNIQUE INDEX `idx_residents_nik` ON `residents` (`nik`);--> statement-breakpoint
CREATE INDEX `idx_residents_no_kk` ON `residents` (`no_kk`);--> statement-breakpoint
CREATE INDEX `idx_residents_nama_lengkap` ON `residents` (`nama_lengkap`);--> statement-breakpoint
CREATE INDEX `idx_residents_rt_rw` ON `residents` (`rt`,`rw`);--> statement-breakpoint
CREATE INDEX `idx_residents_unsur_pemilih` ON `residents` (`unsur_pemilih`);--> statement-breakpoint
CREATE INDEX `idx_residents_kategori` ON `residents` (`kategori`);--> statement-breakpoint
CREATE INDEX `idx_residents_created_at` ON `residents` (`created_at`);--> statement-breakpoint
CREATE TABLE `session` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`token` text NOT NULL,
	`expires_at` integer NOT NULL,
	`ip_address` text,
	`user_agent` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `session_token_unique` ON `session` (`token`);--> statement-breakpoint
CREATE INDEX `idx_session_user_id` ON `session` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_session_token` ON `session` (`token`);--> statement-breakpoint
CREATE TABLE `telegram_conversation_states` (
	`chat_id` text PRIMARY KEY NOT NULL,
	`step` text NOT NULL,
	`temp_data` text,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `telegram_whitelisted_users` (
	`id` text PRIMARY KEY NOT NULL,
	`chat_id` text NOT NULL,
	`username` text,
	`full_name` text,
	`is_active` integer DEFAULT true NOT NULL,
	`added_by` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`added_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `telegram_whitelisted_users_chat_id_unique` ON `telegram_whitelisted_users` (`chat_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `idx_tg_whitelist_chat_id` ON `telegram_whitelisted_users` (`chat_id`);--> statement-breakpoint
CREATE TABLE `user` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`email_verified` integer DEFAULT false NOT NULL,
	`image` text,
	`role` text DEFAULT 'operator' NOT NULL,
	`banned` integer DEFAULT false NOT NULL,
	`ban_reason` text,
	`ban_expires` integer,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
CREATE TABLE `verification` (
	`id` text PRIMARY KEY NOT NULL,
	`identifier` text NOT NULL,
	`value` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer DEFAULT (unixepoch()),
	`updated_at` integer DEFAULT (unixepoch())
);
