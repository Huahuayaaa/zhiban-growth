CREATE TABLE `ai_training_hint` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`run_id` text NOT NULL,
	`step` integer NOT NULL,
	`content` text NOT NULL,
	`create_time` text DEFAULT '' NOT NULL,
	FOREIGN KEY (`run_id`) REFERENCES `train_run`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `hint_run_step` ON `ai_training_hint` (`run_id`,`step`);--> statement-breakpoint
CREATE TABLE `ai_review_log` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`submission_id` integer NOT NULL,
	`model` text,
	`state` text NOT NULL,
	`details` text,
	`create_time` text DEFAULT '' NOT NULL,
	FOREIGN KEY (`submission_id`) REFERENCES `labor_submit`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `ai_review_submission` ON `ai_review_log` (`submission_id`);--> statement-breakpoint
CREATE TABLE `ai_growth_report` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`student_user_id` integer NOT NULL,
	`semester` text NOT NULL,
	`snapshot_hash` text NOT NULL,
	`content` text NOT NULL,
	`model` text,
	`create_time` text DEFAULT '' NOT NULL,
	FOREIGN KEY (`student_user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `growth_student_snapshot` ON `ai_growth_report` (`student_user_id`,`semester`,`snapshot_hash`);--> statement-breakpoint
ALTER TABLE `media` ADD `evidence` text DEFAULT '[]' NOT NULL;--> statement-breakpoint
ALTER TABLE `labor_submit` ADD `ai_state` text DEFAULT 'none' NOT NULL;--> statement-breakpoint
ALTER TABLE `labor_submit` ADD `ai_details` text;--> statement-breakpoint
ALTER TABLE `labor_submit` ADD `ai_checked_time` text;--> statement-breakpoint
ALTER TABLE `labor_submit` ADD `ai_run_token` text;--> statement-breakpoint
ALTER TABLE `virtual_train_record` ADD `ai_report` text;--> statement-breakpoint
ALTER TABLE `virtual_train_record` ADD `ai_report_state` text DEFAULT 'none' NOT NULL;