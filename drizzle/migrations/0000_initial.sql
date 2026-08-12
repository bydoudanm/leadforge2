-- Create users table
CREATE TABLE IF NOT EXISTS `users` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `openId` varchar(64) NOT NULL UNIQUE,
  `name` text,
  `email` varchar(320),
  `loginMethod` varchar(64),
  `role` enum('user','admin') NOT NULL DEFAULT 'user',
  `plan` enum('starter','growth','pro','scale') NOT NULL DEFAULT 'starter',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `lastSignedIn` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create leads table
CREATE TABLE IF NOT EXISTS `leads` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `userId` int NOT NULL,
  `companyName` varchar(255) NOT NULL,
  `industry` varchar(100),
  `website` varchar(255),
  `email` varchar(320),
  `phone` varchar(20),
  `location` varchar(255),
  `status` enum('new','contacted','interested','qualified','converted','lost') NOT NULL DEFAULT 'new',
  `score` int DEFAULT 0,
  `revenue` decimal(12,2),
  `employees` int,
  `foundDate` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `lastContactedAt` timestamp,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE
);

-- Create campaigns table
CREATE TABLE IF NOT EXISTS `campaigns` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `userId` int NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text,
  `status` enum('draft','active','paused','completed') NOT NULL DEFAULT 'draft',
  `totalLeads` int DEFAULT 0,
  `sentEmails` int DEFAULT 0,
  `openedEmails` int DEFAULT 0,
  `clickedEmails` int DEFAULT 0,
  `repliedEmails` int DEFAULT 0,
  `conversions` int DEFAULT 0,
  `revenue` decimal(12,2) DEFAULT 0,
  `startDate` timestamp,
  `endDate` timestamp,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE
);

-- Create campaignLeads junction table
CREATE TABLE IF NOT EXISTS `campaignLeads` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `campaignId` int NOT NULL,
  `leadId` int NOT NULL,
  `status` enum('pending','sent','opened','clicked','replied','converted') NOT NULL DEFAULT 'pending',
  `sentAt` timestamp,
  `openedAt` timestamp,
  `clickedAt` timestamp,
  `repliedAt` timestamp,
  `convertedAt` timestamp,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`campaignId`) REFERENCES `campaigns`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`leadId`) REFERENCES `leads`(`id`) ON DELETE CASCADE
);

-- Create analytics table
CREATE TABLE IF NOT EXISTS `analytics` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `userId` int NOT NULL,
  `date` timestamp NOT NULL,
  `leadsDiscovered` int DEFAULT 0,
  `emailsSent` int DEFAULT 0,
  `emailsOpened` int DEFAULT 0,
  `emailsClicked` int DEFAULT 0,
  `emailsReplied` int DEFAULT 0,
  `dealsCreated` int DEFAULT 0,
  `dealsWon` int DEFAULT 0,
  `revenue` decimal(12,2) DEFAULT 0,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE
);

-- Create opportunities table
CREATE TABLE IF NOT EXISTS `opportunities` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `userId` int NOT NULL,
  `leadId` int NOT NULL,
  `campaignId` int,
  `title` varchar(255) NOT NULL,
  `stage` enum('prospect','qualified','proposal','negotiation','won','lost') NOT NULL DEFAULT 'prospect',
  `value` decimal(12,2),
  `probability` int DEFAULT 0,
  `expectedCloseDate` timestamp,
  `notes` text,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`leadId`) REFERENCES `leads`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`campaignId`) REFERENCES `campaigns`(`id`) ON DELETE SET NULL
);

-- Create inboxes table
CREATE TABLE IF NOT EXISTS `inboxes` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `userId` int NOT NULL,
  `email` varchar(320) NOT NULL,
  `provider` enum('gmail','outlook','custom') NOT NULL DEFAULT 'gmail',
  `isActive` boolean DEFAULT true,
  `dailyLimit` int DEFAULT 50,
  `sentToday` int DEFAULT 0,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE
);

-- Create emailTemplates table
CREATE TABLE IF NOT EXISTS `emailTemplates` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `userId` int NOT NULL,
  `name` varchar(255) NOT NULL,
  `subject` varchar(255) NOT NULL,
  `body` text NOT NULL,
  `isActive` boolean DEFAULT true,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX idx_leads_userId ON `leads`(`userId`);
CREATE INDEX idx_leads_status ON `leads`(`status`);
CREATE INDEX idx_campaigns_userId ON `campaigns`(`userId`);
CREATE INDEX idx_campaigns_status ON `campaigns`(`status`);
CREATE INDEX idx_analytics_userId_date ON `analytics`(`userId`, `date`);
CREATE INDEX idx_opportunities_userId ON `opportunities`(`userId`);
CREATE INDEX idx_opportunities_stage ON `opportunities`(`stage`);
CREATE INDEX idx_inboxes_userId ON `inboxes`(`userId`);
CREATE INDEX idx_emailTemplates_userId ON `emailTemplates`(`userId`);
