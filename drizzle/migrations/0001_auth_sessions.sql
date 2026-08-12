-- Authentication additions for local account signup/login.
ALTER TABLE `users`
  ADD COLUMN IF NOT EXISTS `passwordHash` varchar(255) NULL,
  MODIFY COLUMN `email` varchar(320) NOT NULL,
  MODIFY COLUMN `loginMethod` varchar(64) DEFAULT 'password',
  MODIFY COLUMN `plan` enum('free_trial','start','growth','professional','agency','starter','pro','scale') NOT NULL DEFAULT 'free_trial';

CREATE TABLE IF NOT EXISTS `sessions` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `userId` int NOT NULL,
  `tokenHash` varchar(128) NOT NULL UNIQUE,
  `expiresAt` timestamp NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS `idx_sessions_userId` ON `sessions`(`userId`);
CREATE INDEX IF NOT EXISTS `idx_sessions_expiresAt` ON `sessions`(`expiresAt`);
