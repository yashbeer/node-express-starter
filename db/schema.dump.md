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
  `isEmailVerified` boolean default '0',
  `createdAt` datetime default CURRENT_TIMESTAMP,
  `updatedAt` datetime default CURRENT_TIMESTAMP
)

CREATE TABLE `tokens` (
  `id` integer not null primary key autoincrement,
  `token` text not null,
  `userId` integer not null,
  `type` text check (`type` in ('refresh',
  'reset_password',
  'verify_email')) not null,
  `expires` datetime not null,
  `blacklisted` boolean default '0',
  `createdAt` datetime default CURRENT_TIMESTAMP,
  `updatedAt` datetime default CURRENT_TIMESTAMP,
  foreign key(`userId`) references `users`(`id`)
)


```