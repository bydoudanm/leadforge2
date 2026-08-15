import { describe, expect, it } from "vitest";
import { eligibleRotationInboxes, selectNextRotationInbox } from "./inboxRotation";

const inboxes = [
  { id: 1, isActive: true, connectionStatus: "connected" as const, dailyLimit: 50, sentToday: 10 },
  { id: 2, isActive: true, connectionStatus: "connected" as const, dailyLimit: 50, sentToday: 49 },
  { id: 3, isActive: true, connectionStatus: "pending" as const, dailyLimit: 50, sentToday: 0 },
  { id: 4, isActive: false, connectionStatus: "connected" as const, dailyLimit: 50, sentToday: 0 },
];

describe("inbox rotation helpers", () => {
  it("keeps only selected active connected inboxes with remaining capacity", () => {
    expect(eligibleRotationInboxes(inboxes, [1, 2, 3, 4]).map((inbox) => inbox.id)).toEqual([1, 2]);
  });

  it("selects the next inbox in round-robin order and advances the index", () => {
    const first = selectNextRotationInbox(inboxes, { enabled: true, strategy: "round_robin", delaySeconds: 60, selectedInboxIds: [1, 2], nextInboxIndex: 0 });
    const second = selectNextRotationInbox(inboxes, { enabled: true, strategy: "round_robin", delaySeconds: 60, selectedInboxIds: [1, 2], nextInboxIndex: first.nextInboxIndex });
    const third = selectNextRotationInbox(inboxes, { enabled: true, strategy: "round_robin", delaySeconds: 60, selectedInboxIds: [1, 2], nextInboxIndex: second.nextInboxIndex });

    expect(first.inbox?.id).toBe(1);
    expect(second.inbox?.id).toBe(2);
    expect(third.inbox?.id).toBe(1);
    expect(third.nextInboxIndex).toBe(1);
  });

  it("does not select an inbox when the loop is paused or nothing is eligible", () => {
    expect(selectNextRotationInbox(inboxes, { enabled: false, strategy: "round_robin", delaySeconds: 60, selectedInboxIds: [1], nextInboxIndex: 0 }).inbox).toBeNull();
    expect(selectNextRotationInbox(inboxes, { enabled: true, strategy: "round_robin", delaySeconds: 60, selectedInboxIds: [3, 4], nextInboxIndex: 0 }).inbox).toBeNull();
  });
});
