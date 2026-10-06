CREATE TABLE `article` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`cover` text,
	`content` text NOT NULL,
	`author` text,
	`category` text,
	`sort` integer DEFAULT 0,
	`create_time` text DEFAULT '' NOT NULL,
	`update_time` text DEFAULT '' NOT NULL,
	`is_deleted` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `class_student` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`class_id` integer NOT NULL,
	`student_user_id` integer NOT NULL,
	`create_time` text DEFAULT '' NOT NULL,
	`is_deleted` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`class_id`) REFERENCES `class`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`student_user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `class_student_unique` ON `class_student` (`class_id`,`student_user_id`);--> statement-breakpoint
CREATE TABLE `class` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`class_name` text NOT NULL,
	`join_code` text,
	`create_time` text DEFAULT '' NOT NULL,
	`update_time` text DEFAULT '' NOT NULL,
	`is_deleted` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `class_join_code_unique` ON `class` (`join_code`);--> statement-breakpoint
CREATE TABLE `labor_file` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`student_user_id` integer NOT NULL,
	`total_labor_time` integer DEFAULT 0,
	`finish_task_count` integer DEFAULT 0,
	`virtual_train_count` integer DEFAULT 0,
	`summary` text,
	`semester` text,
	`create_time` text DEFAULT '' NOT NULL,
	`update_time` text DEFAULT '' NOT NULL,
	`is_deleted` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`student_user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `file_student_semester` ON `labor_file` (`student_user_id`,`semester`);--> statement-breakpoint
CREATE TABLE `login_attempt` (
	`key` text PRIMARY KEY NOT NULL,
	`count` integer DEFAULT 0,
	`reset` integer
);
--> statement-breakpoint
CREATE TABLE `media` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` integer NOT NULL,
	`name` text,
	`mime` text,
	`size` integer,
	`create_time` text DEFAULT '' NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `notice` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`receive_user_id` integer NOT NULL,
	`title` text NOT NULL,
	`content` text,
	`type` text,
	`target` text,
	`is_read` integer DEFAULT 0,
	`create_time` text DEFAULT '' NOT NULL,
	`is_deleted` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`receive_user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `notice_recipient` ON `notice` (`receive_user_id`);--> statement-breakpoint
CREATE TABLE `course_resource` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`teacher_id` integer NOT NULL,
	`title` text NOT NULL,
	`stage` text,
	`category` text,
	`topic` text,
	`kind` text,
	`content` text NOT NULL,
	`source` text NOT NULL,
	`favorite` integer DEFAULT 0,
	`create_time` text DEFAULT '' NOT NULL,
	`update_time` text DEFAULT '' NOT NULL,
	`is_deleted` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`teacher_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `resource_teacher` ON `course_resource` (`teacher_id`);--> statement-breakpoint
CREATE TABLE `session` (
	`token` text PRIMARY KEY NOT NULL,
	`user_id` integer NOT NULL,
	`expires` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `labor_submit` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`task_id` integer NOT NULL,
	`student_user_id` integer NOT NULL,
	`media_url` text,
	`student_comment` text,
	`ai_score` real,
	`ai_result` text,
	`ai_notes` text,
	`teacher_score` real,
	`teacher_comment` text,
	`status` text DEFAULT 'ai_check' NOT NULL,
	`create_time` text DEFAULT '' NOT NULL,
	`update_time` text DEFAULT '' NOT NULL,
	`is_deleted` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`task_id`) REFERENCES `labor_task`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`student_user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `submit_student_task` ON `labor_submit` (`task_id`,`student_user_id`);--> statement-breakpoint
CREATE INDEX `submit_student` ON `labor_submit` (`student_user_id`);--> statement-breakpoint
CREATE TABLE `labor_task` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`task_name` text NOT NULL,
	`task_desc` text,
	`task_type` text,
	`teacher_id` integer NOT NULL,
	`class_id` integer NOT NULL,
	`resource_id` integer,
	`train_scene` text,
	`minutes` integer DEFAULT 30,
	`start_time` text,
	`end_time` text,
	`status` text DEFAULT 'normal' NOT NULL,
	`create_time` text DEFAULT '' NOT NULL,
	`update_time` text DEFAULT '' NOT NULL,
	`is_deleted` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`teacher_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`class_id`) REFERENCES `class`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`resource_id`) REFERENCES `course_resource`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `task_teacher` ON `labor_task` (`teacher_id`);--> statement-breakpoint
CREATE INDEX `task_class` ON `labor_task` (`class_id`);--> statement-breakpoint
CREATE TABLE `teacher_class` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`teacher_user_id` integer NOT NULL,
	`class_id` integer NOT NULL,
	`role_in_class` text DEFAULT 'labor_teacher',
	`create_time` text DEFAULT '' NOT NULL,
	`is_deleted` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`teacher_user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`class_id`) REFERENCES `class`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `teacher_class_unique` ON `teacher_class` (`teacher_user_id`,`class_id`);--> statement-breakpoint
CREATE TABLE `train_run` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` integer NOT NULL,
	`scene` text,
	`step` integer DEFAULT 0,
	`wrongs` text DEFAULT '[]',
	`started` integer,
	`completed` integer DEFAULT 0,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `virtual_train_record` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`student_user_id` integer NOT NULL,
	`scene_name` text NOT NULL,
	`total_score` real,
	`wrong_step` text,
	`train_duration` integer,
	`create_time` text DEFAULT '' NOT NULL,
	`is_deleted` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`student_user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `train_student` ON `virtual_train_record` (`student_user_id`);--> statement-breakpoint
CREATE TABLE `user` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`username` text NOT NULL,
	`password` text NOT NULL,
	`real_name` text NOT NULL,
	`role` text NOT NULL,
	`phone` text DEFAULT '',
	`class_id` integer,
	`child_user_id` integer,
	`avatar` text DEFAULT '',
	`binding_code` text,
	`is_demo` integer DEFAULT 0,
	`create_time` text DEFAULT '' NOT NULL,
	`update_time` text DEFAULT '' NOT NULL,
	`is_deleted` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_username_unique` ON `user` (`username`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_binding_code_unique` ON `user` (`binding_code`);