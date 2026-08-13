CREATE TABLE `analytics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`date` timestamp NOT NULL,
	`leadsDiscovered` int DEFAULT 0,
	`emailsSent` int DEFAULT 0,
	`emailsOpened` int DEFAULT 0,
	`emailsClicked` int DEFAULT 0,
	`emailsReplied` int DEFAULT 0,
	`dealsCreated` int DEFAULT 0,
	`dealsWon` int DEFAULT 0,
	`revenue` decimal(12,2) DEFAULT '0',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `analytics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `campaignLeads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`campaignId` int NOT NULL,
	`leadId` int NOT NULL,
	`status` enum('pending','sent','opened','clicked','replied','converted') NOT NULL DEFAULT 'pending',
	`sentAt` timestamp,
	`openedAt` timestamp,
	`clickedAt` timestamp,
	`repliedAt` timestamp,
	`convertedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `campaignLeads_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `campaigns` (
	`id` int AUTO_INCREMENT NOT NULL,
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
	`revenue` decimal(12,2) DEFAULT '0',
	`startDate` timestamp,
	`endDate` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `campaigns_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `emailTemplates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`subject` varchar(255) NOT NULL,
	`body` text NOT NULL,
	`isActive` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `emailTemplates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `inboxes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`email` varchar(320) NOT NULL,
	`provider` enum('gmail','outlook','custom') NOT NULL DEFAULT 'gmail',
	`isActive` boolean DEFAULT true,
	`dailyLimit` int DEFAULT 50,
	`sentToday` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `inboxes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `leads` (
	`id` int AUTO_INCREMENT NOT NULL,
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
	`foundDate` timestamp NOT NULL DEFAULT (now()),
	`lastContactedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `leads_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `opportunities` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`leadId` int NOT NULL,
	`campaignId` int,
	`title` varchar(255) NOT NULL,
	`stage` enum('prospect','qualified','proposal','negotiation','won','lost') NOT NULL DEFAULT 'prospect',
	`value` decimal(12,2),
	`probability` int DEFAULT 0,
	`expectedCloseDate` timestamp,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `opportunities_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `outreachLists` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`companyName` varchar(255) NOT NULL,
	`parentCompanyName` varchar(255),
	`parentCompanyEmail` varchar(320),
	`parentFounderEmail` varchar(320),
	`branchCount` int DEFAULT 1,
	`branchLocationsJson` text,
	`category` varchar(100),
	`opportunity` varchar(100),
	`score` int DEFAULT 0,
	`email` varchar(320),
	`phone` varchar(50),
	`website` varchar(255),
	`location` varchar(255),
	`searchMode` varchar(50) NOT NULL DEFAULT 'individual',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `outreachLists_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `savedFilterViews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(120) NOT NULL,
	`searchMode` enum('individual','company') NOT NULL,
	`filtersJson` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `savedFilterViews_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`tokenHash` varchar(128) NOT NULL,
	`expiresAt` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `sessions_id` PRIMARY KEY(`id`),
	CONSTRAINT `sessions_tokenHash_unique` UNIQUE(`tokenHash`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320) NOT NULL,
	`passwordHash` varchar(255),
	`loginMethod` varchar(64) DEFAULT 'password',
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`plan` enum('free_trial','start','growth','professional','agency','starter','pro','scale') NOT NULL DEFAULT 'free_trial',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	`emailAlertsEnabled` boolean NOT NULL DEFAULT true,
	`campaignAlertsEnabled` boolean NOT NULL DEFAULT true,
	`weeklyReportsEnabled` boolean NOT NULL DEFAULT true,
	`productUpdatesEnabled` boolean NOT NULL DEFAULT false,
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
);
