CREATE TABLE `inboxRotationSettings` (
	`userId` int NOT NULL,
	`enabled` boolean NOT NULL DEFAULT false,
	`strategy` enum('round_robin') NOT NULL DEFAULT 'round_robin',
	`delaySeconds` int NOT NULL DEFAULT 60,
	`selectedInboxIdsJson` text NOT NULL,
	`nextInboxIndex` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `inboxRotationSettings_userId` PRIMARY KEY(`userId`)
);
--> statement-breakpoint
ALTER TABLE `inboxes` ADD `connectionStatus` enum('pending','connected','needs_reauth') DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE `inboxes` ADD `lastConnectedAt` timestamp;