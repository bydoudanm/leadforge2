export type RotationInbox = {
  id: number;
  isActive: boolean | null;
  connectionStatus: "pending" | "connected" | "needs_reauth";
  dailyLimit: number | null;
  sentToday: number | null;
};

export type RotationSettings = {
  enabled: boolean;
  strategy: "round_robin";
  delaySeconds: number;
  selectedInboxIds: number[];
  nextInboxIndex: number;
};

export function eligibleRotationInboxes(inboxes: RotationInbox[], selectedInboxIds: number[]) {
  const selected = new Set(selectedInboxIds);
  return inboxes.filter((inbox) => {
    const dailyLimit = inbox.dailyLimit ?? 0;
    const sentToday = inbox.sentToday ?? 0;
    return selected.has(inbox.id) && inbox.isActive === true && inbox.connectionStatus === "connected" && sentToday < dailyLimit;
  });
}

export function normalizeRotationSettings(settings: RotationSettings, inboxes: RotationInbox[]) {
  const availableIds = new Set(inboxes.map((inbox) => inbox.id));
  const selectedInboxIds = settings.selectedInboxIds.filter((id) => availableIds.has(id));
  const eligible = eligibleRotationInboxes(inboxes, selectedInboxIds);
  const nextInboxIndex = eligible.length === 0 ? 0 : Math.min(Math.max(settings.nextInboxIndex, 0), eligible.length - 1);
  return { ...settings, selectedInboxIds, nextInboxIndex };
}

export function selectNextRotationInbox(inboxes: RotationInbox[], settings: RotationSettings) {
  const normalized = normalizeRotationSettings(settings, inboxes);
  const eligible = eligibleRotationInboxes(inboxes, normalized.selectedInboxIds);
  if (!normalized.enabled || eligible.length === 0) return { inbox: null, nextInboxIndex: normalized.nextInboxIndex };
  const inbox = eligible[normalized.nextInboxIndex % eligible.length] ?? null;
  return { inbox, nextInboxIndex: eligible.length === 0 ? 0 : (normalized.nextInboxIndex + 1) % eligible.length };
}
