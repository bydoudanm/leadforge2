import { AlertTriangle, Check, Clock3, Inbox as InboxIcon, Mail, Plus, RefreshCw, ShieldCheck, Trash2, Zap } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import AcquisitionSidebar from "@/components/AcquisitionSidebar";
import ThemeToggle from "@/components/ThemeToggle";

type InboxRecord = {
  id: number;
  email: string;
  provider: "gmail" | "outlook" | "custom";
  isActive: boolean | null;
  connectionStatus: "pending" | "connected" | "needs_reauth";
  dailyLimit: number | null;
  sentToday: number | null;
  createdAt: string;
};

type RotationSettings = {
  enabled: boolean;
  strategy: "round_robin";
  delaySeconds: number;
  selectedInboxIds: number[];
  nextInboxIndex: number;
};

type InboxPayload = {
  inboxes: InboxRecord[];
  rotation: RotationSettings;
  connectedCount: number;
};

type User = { id: number; name: string | null; email: string; plan: string };

async function api<T>(path: string, options?: RequestInit) {
  const response = await fetch(path, { credentials: "include", ...options });
  if (!response.ok) {
    const body = await response.json().catch(() => ({})) as { error?: string };
    throw new Error(body.error || `Request failed with status ${response.status}`);
  }
  return response.status === 204 ? undefined as T : await response.json() as T;
}

function statusCopy(status: InboxRecord["connectionStatus"]) {
  if (status === "connected") return { label: "Connected", className: "text-emerald-300 bg-emerald-500/10 border-emerald-500/30" };
  if (status === "needs_reauth") return { label: "Reconnect required", className: "text-amber-300 bg-amber-500/10 border-amber-500/30" };
  return { label: "Authorization pending", className: "text-slate-300 bg-slate-500/10 border-slate-600" };
}

export default function Inbox() {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [inboxes, setInboxes] = useState<InboxRecord[]>([]);
  const [rotation, setRotation] = useState<RotationSettings>({ enabled: false, strategy: "round_robin", delaySeconds: 60, selectedInboxIds: [], nextInboxIndex: 0 });
  const [connectedCount, setConnectedCount] = useState(0);
  const [email, setEmail] = useState("");
  const [dailyLimit, setDailyLimit] = useState("50");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const eligibleCount = useMemo(() => inboxes.filter((inbox) => rotation.selectedInboxIds.includes(inbox.id) && inbox.isActive === true && inbox.connectionStatus === "connected" && (inbox.sentToday ?? 0) < (inbox.dailyLimit ?? 0)).length, [inboxes, rotation.selectedInboxIds]);

  const load = async () => {
    setLoading(true);
    try {
      const payload = await api<InboxPayload>("/api/inboxes");
      setInboxes(payload.inboxes);
      setRotation(payload.rotation);
      setConnectedCount(payload.connectedCount);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load inboxes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    api<User>("/api/auth/me")
      .then((nextUser) => { if (active) setUser(nextUser); })
      .catch((err: unknown) => { if (active) setLocation(err instanceof Error && err.message.includes("401") ? "/login" : "/"); });
    return () => { active = false; };
  }, [setLocation]);

  useEffect(() => {
    if (user) void load();
  }, [user]);

  const addInbox = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setNotice("");
    try {
      const created = await api<InboxRecord>("/api/inboxes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, provider: "gmail", dailyLimit: Number(dailyLimit) || 50 }) });
      setInboxes((current) => [created, ...current]);
      setEmail("");
      setNotice("Inbox added. Gmail authorization is still required before it can send.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to add this inbox.");
    } finally {
      setSaving(false);
    }
  };

  const updateInbox = async (id: number, patch: { isActive?: boolean; dailyLimit?: number }) => {
    try {
      const updated = await api<InboxRecord>(`/api/inboxes/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(patch) });
      setInboxes((current) => current.map((inbox) => inbox.id === id ? updated : inbox));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update this inbox.");
    }
  };

  const removeInbox = async (id: number) => {
    try {
      await api<void>(`/api/inboxes/${id}`, { method: "DELETE" });
      setInboxes((current) => current.filter((inbox) => inbox.id !== id));
      setRotation((current) => ({ ...current, selectedInboxIds: current.selectedInboxIds.filter((selectedId) => selectedId !== id) }));
      setNotice("Inbox removed from the rotation pool.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to remove this inbox.");
    }
  };

  const saveRotation = async () => {
    setSaving(true);
    setNotice("");
    try {
      const saved = await api<RotationSettings & { eligibleCount: number }>("/api/inboxes/rotation/settings", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ enabled: rotation.enabled, delaySeconds: rotation.delaySeconds, selectedInboxIds: rotation.selectedInboxIds }) });
      setRotation(saved);
      setNotice(saved.enabled ? `Rotation loop saved across ${saved.selectedInboxIds.length} selected inboxes.` : "Rotation loop settings saved and paused.");
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save rotation settings.");
    } finally {
      setSaving(false);
    }
  };

  const toggleSelected = (id: number) => setRotation((current) => ({ ...current, selectedInboxIds: current.selectedInboxIds.includes(id) ? current.selectedInboxIds.filter((selectedId) => selectedId !== id) : [...current.selectedInboxIds, id] }));

  if (error && !user) return <div className="min-h-screen bg-[#020914] text-red-300 grid place-items-center p-6">{error}</div>;
  if (!user || loading) return <div className="min-h-screen bg-[#020914] text-slate-300 grid place-items-center">Loading Inbox…</div>;

  return (
    <div className="min-h-screen bg-[#020914] text-slate-200 overflow-x-hidden">
      <header className="h-16 border-b border-slate-800/90 bg-[#050d19]/95 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
        <div className="flex items-center gap-3 min-w-[185px]"><div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-500 grid place-items-center shadow-lg shadow-violet-950/40"><Zap className="w-5 h-5 text-white" /></div><div className="leading-tight"><div className="font-semibold text-white">LeadForge</div><div className="text-[10px] text-slate-500">AI Client Acquisition</div></div></div>
        <nav className="hidden lg:flex items-center gap-1 h-full"><button onClick={() => setLocation("/lead-search")} className="px-4 h-full inline-flex items-center gap-2 text-xs font-medium text-slate-400 border-b-2 border-transparent hover:text-white"><Mail className="w-4 h-4" />Search</button><button onClick={() => setLocation("/outreach")} className="px-4 h-full inline-flex items-center gap-2 text-xs font-medium text-slate-400 border-b-2 border-transparent hover:text-white"><Mail className="w-4 h-4" />Outreach</button><button className="px-4 h-full inline-flex items-center gap-2 text-xs font-medium text-violet-300 border-b-2 border-violet-500 bg-violet-500/5"><InboxIcon className="w-4 h-4" />Inbox</button></nav>
        <div className="flex items-center gap-3"><ThemeToggle compact /><button onClick={() => setLocation("/settings")} className="p-2 rounded-lg border border-slate-800 text-slate-400 hover:text-white"><ShieldCheck className="w-4 h-4" /></button><div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900/50 text-xs"><div className="w-6 h-6 rounded-full bg-violet-600 text-white grid place-items-center font-semibold">{user.name?.[0] || user.email[0].toUpperCase()}</div><span className="text-slate-300 hidden sm:inline">{user.name || user.email}</span></div></div>
      </header>

      <div className="flex min-h-[calc(100vh-4rem)]"><AcquisitionSidebar activeMode="none" expanded={sidebarOpen} onToggle={() => setSidebarOpen((open) => !open)} onNavigate={setLocation} onLogout={async () => { await api<{ success: boolean }>("/api/auth/logout", { method: "POST" }); setLocation("/"); }} />
        <main className="flex-1 p-4 lg:p-8 space-y-6 max-w-7xl mx-auto">
          <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-[10px] uppercase tracking-[0.2em] text-violet-300">Deliverability workspace</p><h1 className="text-2xl font-semibold text-white tracking-tight mt-1">Inbox rotation</h1><p className="text-xs text-slate-400 mt-1 max-w-2xl">Manage the Gmail accounts that can be authorized for outreach. LeadForge rotates only across selected, active inboxes with remaining daily capacity.</p></div><div className="rounded-xl border border-slate-800 bg-[#071321]/90 px-4 py-3 text-right"><div className="text-[10px] uppercase tracking-wide text-slate-500">Connected inboxes</div><div className="text-xl font-semibold text-emerald-300">{connectedCount}<span className="text-xs text-slate-500"> / {inboxes.length}</span></div></div></div>

          {notice && <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-xs text-emerald-300">{notice}</div>}
          {error && <div className="rounded-lg border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-xs text-rose-300">{error}</div>}

          <section className="grid grid-cols-1 xl:grid-cols-[1.15fr_0.85fr] gap-4">
            <div className="rounded-xl border border-slate-800 bg-[#071321]/90 overflow-hidden"><div className="p-5 border-b border-slate-800"><div className="flex items-center gap-2 text-white text-sm font-medium"><InboxIcon className="w-4 h-4 text-violet-300" /> Gmail inbox pool</div><p className="text-[11px] text-slate-500 mt-1">Add addresses here first. Credentials and OAuth tokens are never entered into this form.</p></div><form onSubmit={addInbox} className="p-5 flex flex-col sm:flex-row gap-3"><label className="flex-1"><span className="block text-[10px] uppercase tracking-wide text-slate-500 mb-1">Gmail address</span><input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@company.com" className="w-full rounded-lg border border-slate-700 bg-slate-950/50 px-3 py-2.5 text-xs text-white outline-none focus:border-violet-400" /></label><label className="sm:w-28"><span className="block text-[10px] uppercase tracking-wide text-slate-500 mb-1">Daily cap</span><input required type="number" min="1" max="500" value={dailyLimit} onChange={(event) => setDailyLimit(event.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-950/50 px-3 py-2.5 text-xs text-white outline-none focus:border-violet-400" /></label><button disabled={saving} type="submit" className="self-end inline-flex items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-violet-500 disabled:opacity-60"><Plus className="w-4 h-4" />Add Inbox</button></form><div className="px-5 pb-5 space-y-2">{inboxes.length === 0 ? <div className="rounded-lg border border-dashed border-slate-700 p-8 text-center text-xs text-slate-500">No inboxes yet. Add your first Gmail address to start building a rotation pool.</div> : inboxes.map((inbox) => { const status = statusCopy(inbox.connectionStatus); const selected = rotation.selectedInboxIds.includes(inbox.id); return <div key={inbox.id} className="rounded-lg border border-slate-800 bg-slate-950/35 p-3 flex flex-col md:flex-row md:items-center gap-3"><label className="flex items-center gap-3 flex-1 min-w-0"><input type="checkbox" checked={selected} onChange={() => toggleSelected(inbox.id)} aria-label={`Select ${inbox.email} for rotation`} className="accent-violet-500" /><div className="min-w-0"><div className="text-xs font-medium text-white truncate">{inbox.email}</div><div className="text-[10px] text-slate-500">Gmail · {inbox.sentToday ?? 0}/{inbox.dailyLimit ?? 0} sent today</div></div></label><span className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[9px] ${status.className}`}>{inbox.connectionStatus === "connected" ? <Check className="w-3 h-3" /> : <Clock3 className="w-3 h-3" />}{status.label}</span><div className="flex items-center gap-2"><button type="button" onClick={() => setNotice("Authorize this Gmail account through the connected Gmail integration before enabling it for sends.")} className="rounded-md border border-slate-700 px-2.5 py-1.5 text-[10px] text-slate-300 hover:border-violet-400 hover:text-white">Connect</button><button type="button" onClick={() => void updateInbox(inbox.id, { isActive: inbox.isActive !== true })} className={`rounded-md border px-2.5 py-1.5 text-[10px] ${inbox.isActive === true ? "border-emerald-500/30 text-emerald-300" : "border-slate-700 text-slate-500"}`}>{inbox.isActive === true ? "Active" : "Paused"}</button><button type="button" onClick={() => void removeInbox(inbox.id)} aria-label={`Remove ${inbox.email}`} className="rounded-md border border-rose-500/20 p-1.5 text-rose-300 hover:bg-rose-500/10"><Trash2 className="w-3.5 h-3.5" /></button></div></div>; })}</div></div>

            <div className="rounded-xl border border-slate-800 bg-[#071321]/90 overflow-hidden"><div className="p-5 border-b border-slate-800"><div className="flex items-center justify-between gap-3"><div><div className="flex items-center gap-2 text-white text-sm font-medium"><RefreshCw className="w-4 h-4 text-cyan-300" /> Rotation loop</div><p className="text-[11px] text-slate-500 mt-1">Round-robin selection with a safety delay between sends.</p></div><button type="button" role="switch" aria-checked={rotation.enabled} onClick={() => setRotation((current) => ({ ...current, enabled: !current.enabled }))} className={`relative h-6 w-11 rounded-full border ${rotation.enabled ? "border-violet-400 bg-violet-600" : "border-slate-700 bg-slate-900"}`}><span className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-transform ${rotation.enabled ? "translate-x-5" : "translate-x-1"}`} /></button></div></div><div className="p-5 space-y-5"><div className="rounded-lg border border-cyan-500/20 bg-cyan-500/5 p-3 text-[11px] text-cyan-100"><div className="flex items-center gap-2 font-medium"><ShieldCheck className="w-4 h-4" />Protect your inbox while scaling safely.</div><p className="text-cyan-100/60 mt-1">Only connected inboxes with remaining daily capacity can be selected for an active loop.</p></div><label className="block"><span className="block text-[10px] uppercase tracking-wide text-slate-500 mb-1">Delay between sends (seconds)</span><input type="number" min="30" max="3600" value={rotation.delaySeconds} onChange={(event) => setRotation((current) => ({ ...current, delaySeconds: Number(event.target.value) || 30 }))} className="w-full rounded-lg border border-slate-700 bg-slate-950/50 px-3 py-2.5 text-xs text-white outline-none focus:border-cyan-400" /></label><div><div className="flex items-center justify-between text-[10px] text-slate-500 mb-2"><span>Selected inboxes</span><span>{rotation.selectedInboxIds.length} selected · {eligibleCount} eligible now</span></div><div className="space-y-1">{rotation.selectedInboxIds.length === 0 ? <p className="text-xs text-slate-500">Select two or more inboxes to build a rotation pool.</p> : rotation.selectedInboxIds.map((id, index) => { const inbox = inboxes.find((candidate) => candidate.id === id); return <div key={id} className="flex items-center gap-2 rounded-md border border-slate-800 px-2.5 py-2 text-[10px] text-slate-300"><span className="grid h-5 w-5 place-items-center rounded-full bg-violet-500/15 text-violet-200">{index + 1}</span><span className="truncate">{inbox?.email || "Inbox removed"}</span></div>; })}</div></div><button type="button" onClick={() => void saveRotation()} disabled={saving} className="w-full rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2.5 text-xs font-semibold text-white hover:from-violet-500 hover:to-indigo-500 disabled:opacity-60">{saving ? "Saving…" : rotation.enabled ? "Save active rotation loop" : "Save rotation settings"}</button>{rotation.enabled && eligibleCount === 0 && <div className="flex items-start gap-2 text-[10px] text-amber-300"><AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />Rotation is configured but cannot send until at least one selected inbox completes Gmail authorization.</div>}</div></div>
          </section>
        </main>
      </div>
    </div>
  );
}
