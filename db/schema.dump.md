```
CREATE TABLE `knex_migrations` (
  `id` integer not null primary key autoincrement,
  `name` varchar(255),
  `batch` integer,
  `migration_time` datetime
)

CREATE TABLE `knex_migrations_lock` (
  `index` integer not null primary key autoincrement,
  `is_locked` integer
)

CREATE TABLE `users` (
  `id` integer not null primary key autoincrement,
  `name` varchar(255) not null,
  `email` varchar(255) not null,
  `password` varchar(255) not null,
  `role` text check (`role` in ('user',
  'admin')) default 'user',
  `is_email_verified` boolean default '0',
  `created_at` datetime default CURRENT_TIMESTAMP,
  `updated_at` datetime default CURRENT_TIMESTAMP
)

CREATE TABLE `tokens` (
  `id` integer not null primary key autoincrement,
  `token` text not null,
  `user_id` integer not null,
  `type` text check (`type` in ('refresh',
  'reset_password',
  'verify_email')) not null,
  `expires` datetime not null,
  `blacklisted` boolean default '0',
  `created_at` datetime default CURRENT_TIMESTAMP,
  `updated_at` datetime default CURRENT_TIMESTAMP,
  foreign key(`user_id`) references `users`(`id`)
)

CREATE TABLE `teams` (
  `id` integer not null primary key autoincrement,
  `team_name` varchar(255) not null,
  `created_at` datetime default CURRENT_TIMESTAMP,
  `updated_at` datetime default CURRENT_TIMESTAMP
)

CREATE TABLE `teamspaces` (
  `id` integer not null primary key autoincrement,
  `user_id` integer not null,
  `team_id` integer not null,
  `role` varchar(255) not null check (`role` in ('owner',
  'member')),
  `joined_at` datetime,
  `created_at` datetime default CURRENT_TIMESTAMP,
  `updated_at` datetime default CURRENT_TIMESTAMP,
  foreign key(`user_id`) references `users`(`id`) on delete CASCADE,
  foreign key(`team_id`) references `teams`(`id`) on delete CASCADE
)

CREATE TABLE `invitations` (
  `id` integer not null primary key autoincrement,
  `team_id` integer not null,
  `team_name` varchar(255) not null,
  `email` varchar(255) not null,
  `role` varchar(255) not null check (`role` in ('owner',
  'member')),
  `invited_by_name` varchar(255) not null,
  `invited_at` datetime,
  `created_at` datetime default CURRENT_TIMESTAMP,
  `updated_at` datetime default CURRENT_TIMESTAMP,
  foreign key(`team_id`) references `teams`(`id`) on delete CASCADE
)


```