import { describe, expect, it, vi } from "vitest";
import * as db from "./db";
import { getRequestUser, hashPassword, startSession, verifyPassword } from "./auth";

describe("LeadForge authentication primitives", () => {
  it("hashes a password without storing the plaintext", () => {
    const password = "correct horse battery staple";
    const hash = hashPassword(password);

    expect(hash).toMatch(/^scrypt\$[^$]+\$[0-9a-f]+$/);
    expect(hash).not.toContain(password);
    expect(verifyPassword(password, hash)).toBe(true);
  });

  it("creates a session cookie and persists only a token hash", async () => {
    const createSession = vi.spyOn(db, "createSession").mockResolvedValue(undefined);
    const response = { cookie: vi.fn() };

    await startSession(42, response as never);

    expect(createSession).toHaveBeenCalledOnce();
    expect(createSession.mock.calls[0]?.[0]).toMatchObject({ userId: 42 });
    expect(createSession.mock.calls[0]?.[0].tokenHash).toMatch(/^[0-9a-f]{64}$/);
    expect(response.cookie).toHaveBeenCalledWith("leadforge_session", expect.any(String), expect.objectContaining({ httpOnly: true }));
    vi.restoreAllMocks();
  });

  it("resolves the authenticated user from the session cookie", async () => {
    vi.spyOn(db, "getSessionByHash").mockResolvedValue({ user: { id: 42, email: "owner@example.com" } } as never);
    const request = { cookies: { leadforge_session: "session-token" } };

    await expect(getRequestUser(request as never)).resolves.toMatchObject({ id: 42, email: "owner@example.com" });
    vi.restoreAllMocks();
  });

  it("rejects an incorrect password and malformed hash", () => {
    const hash = hashPassword("a-secure-password");

    expect(verifyPassword("wrong-password", hash)).toBe(false);
    expect(verifyPassword("a-secure-password", null)).toBe(false);
    expect(verifyPassword("a-secure-password", "invalid-hash")).toBe(false);
  });
});
