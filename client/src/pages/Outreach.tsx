import { Activity, BarChart3, Building2, Download, Layers3, Mail, Search, ShieldCheck, Target, Trash2, Users, Zap } from "lucide-react";
import type { ComponentType } from "react";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import ThemeToggle from "@/components/ThemeToggle";
import AcquisitionSidebar from "@/components/AcquisitionSidebar";
import { filterOutreachItems, type OutreachQueueFilter } from "@/lib/outreachQueue";

type User = { id: number; name: string | null; email: string; plan: string };
type OutreachItem = {
  id: number;
  companyName: string;
  parentCompanyName: string | null;
  parentCompanyEmail: string | null;
  parentFounderEmail: string | null;
  branchCount: number | null;
  branchLocationsJson: string | null;
  category: string | null;
  opportunity: string | null;
  score: number | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  location: string | null;
  searchMode: string;
  createdAt: string;
};

const topNavItems: ReadonlyArray<readonly [string, ComponentType<{ className?: string }>, boolean, string]> = [
  ["Search", Search, false, "/lead-search"],
  ["Leads", Users, false, "/lead-search"],
  ["Opportunities", Target, false, "/lead-search"],
  ["Outreach", Mail, true, "/outreach"],
  ["Reports", BarChart3, false, "/dashboard"],
  ["Integrations", Layers3, false, "/dashboard"],
];

function api<T>(path: string, options?: RequestInit) {
  return fetch(path, { credentials: "include", ...options }).then(async (response) => {
    if (!response.ok) throw new Error(`${response.status}:${await response.text()}`);
    return response.json() as Promise<T>;
  });
}

export default function Outreach() {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [items, setItems] = useState<OutreachItem[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [queueFilter, setQueueFilter] = useState<OutreachQueueFilter>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    api<User>("/api/auth/me")
      .then((nextUser) => active && setUser(nextUser))
      .catch((err: unknown) => {
        if (!active) return;
        if (err instanceof Error && err.message.startsWith("401:")) setLocation("/login");
        else setError("Unable to load outreach workspace.");
      });
    return () => { active = false; };
  }, [setLocation]);

  useEffect(() => {
    if (!user) return;
    let active = true;
    api<OutreachItem[]>("/api/outreach")
      .then((data) => {
        if (active) {
          setItems(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) {
          setError("Unable to load outreach list.");
          setLoading(false);
        }
      });
    return () => { active = false; };
  }, [user]);

  const filteredItems = filterOutreachItems(items, queueFilter);

  if (error) return <div className="min-h-screen bg-[#020914] text-red-300 grid place-items-center p-6">{error}</div>;
  if (!user || loading) return <div className="min-h-screen bg-[#020914] text-slate-300 grid place-items-center">Loading Outreach…</div>;

  return (
    <div className="min-h-screen bg-[#020914] text-slate-200 overflow-x-hidden">
      <header className="h-16 border-b border-slate-800/90 bg-[#050d19]/95 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
        <div className="flex items-center gap-3 min-w-[185px]">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-500 grid place-items-center shadow-lg shadow-violet-950/40"><Zap className="w-5 h-5 text-white" /></div>
          <div className="leading-tight"><div className="font-semibold text-white">LeadForge</div><div className="text-[10px] text-slate-500">AI Client Acquisition</div></div>
        </div>
        <nav className="hidden lg:flex items-center gap-1 h-full">
          {topNavItems.map(([label, Icon, active, path]) => (
            <button key={label} onClick={() => setLocation(path)} className={`px-4 h-full inline-flex items-center gap-2 text-xs font-medium border-b-2 ${active ? "text-violet-300 border-violet-500 bg-violet-500/5" : "text-slate-400 border-transparent hover:text-white"}`}>
              <Icon className="w-4 h-4" />{label}
            </button>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <ThemeToggle compact />
          <button onClick={() => setLocation("/settings")} className="p-2 rounded-lg border border-slate-800 text-slate-400 hover:text-white"><ShieldCheck className="w-4 h-4" /></button>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900/50 text-xs">
            <div className="w-6 h-6 rounded-full bg-violet-600 text-white grid place-items-center font-semibold">{user.name?.[0] || user.email[0].toUpperCase()}</div>
            <span className="text-slate-300 hidden sm:inline">{user.name || user.email}</span>
          </div>
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-4rem)]">
        <AcquisitionSidebar activeMode="none" expanded={sidebarOpen} onToggle={() => setSidebarOpen((open) => !open)} onNavigate={setLocation} onLogout={async () => { await api<{ success: boolean }>("/api/auth/logout", { method: "POST" }); setLocation("/"); }} />

        <main className="flex-1 p-4 lg:p-8 space-y-6 max-w-7xl mx-auto">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-white tracking-tight">Outreach Campaign Queue</h1>
              <p className="text-xs text-slate-400 mt-1">Individual outreach targets and Company outreach targets remain separated for the correct recipient and message strategy.</p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => setLocation("/lead-search")} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 text-xs font-semibold text-white shadow-lg shadow-violet-950/30 hover:from-violet-500 hover:to-indigo-500"><Search className="w-4 h-4" />Find Individual Leads</button>
              <button onClick={() => setLocation("/company-lead-search")} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-violet-500/40 text-xs font-semibold text-violet-200 hover:bg-violet-500/10"><Building2 className="w-4 h-4" />Find Companies</button>
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-[#071321]/90 overflow-hidden">
            <div className="p-4 border-b border-slate-800 space-y-3"><div className="flex flex-wrap items-center justify-between gap-3"><div className="text-xs font-medium text-white">Queued Targets ({filteredItems.length}{queueFilter === "all" ? "" : ` of ${items.length}`})</div><div className="text-[10px] text-slate-400">Campaign Mode: AI Automated Sequence</div></div><div className="flex flex-wrap gap-2" role="group" aria-label="Filter outreach campaigns">{([["all", "All campaigns"], ["individual", "Individual campaigns"], ["company", "Company campaigns"]] as const).map(([value, label]) => <button key={value} type="button" aria-pressed={queueFilter === value} onClick={() => setQueueFilter(value)} className={`rounded-md border px-3 py-1.5 text-[10px] font-medium ${queueFilter === value ? "border-violet-400 bg-violet-600 text-white" : "border-slate-700 bg-slate-900/50 text-slate-400 hover:border-violet-400 hover:text-white"}`}>{label}</button>)}</div></div>
            {filteredItems.length === 0 ? <div className="p-12 text-center text-slate-400 text-xs">{items.length === 0 ? <>No outreach targets yet. Use <span className="text-violet-300 font-medium">Lead Search · Individual</span> or <span className="text-violet-300 font-medium">Company Lead Search · Company</span> to add targeted prospects.</> : <>No {queueFilter === "company" ? "company" : "individual"} campaigns are currently queued.</>}</div> : <div className="space-y-4 p-4"><OutreachModeTable mode="company" items={filteredItems.filter((item) => item.searchMode === "company")} /><OutreachModeTable mode="individual" items={filteredItems.filter((item) => item.searchMode !== "company")} /></div>}
          </div>
        </main>
      </div>
    </div>
  );
}


type OutreachTableMode = "individual" | "company";

function OutreachModeTable({ mode, items }: { mode: OutreachTableMode; items: OutreachItem[] }) {
  if (items.length === 0) return null;
  const companyMode = mode === "company";
  return (
    <section className="rounded-lg border border-slate-800/90 overflow-hidden">
      <div className="px-3 py-2.5 border-b border-slate-800 bg-[#06101c] flex items-center justify-between">
        <div className="text-xs font-medium text-white">{companyMode ? "Company Outreach · Parent Targets" : "Individual Outreach · Owner / Manager Targets"} ({items.length})</div>
        <div className="text-[10px] text-slate-500">{companyMode ? "CEO / Founder or company contact" : "Owner / Manager or business contact"}</div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-left">
          <thead className="bg-[#06101c] text-[10px] text-slate-500">
            <tr>
              <th className="px-4 py-3">{companyMode ? "Parent Company" : "Business"}</th>
              <th className="px-2 py-3">{companyMode ? "Branch Coverage" : "Recipient"}</th>
              <th className="px-2 py-3">Category</th>
              <th className="px-2 py-3">Opportunity</th>
              <th className="px-2 py-3">Score</th>
              <th className="px-2 py-3">{companyMode ? "Company Contact" : "Business Email"}</th>
              <th className="px-2 py-3">Phone</th>
              <th className="px-2 py-3">Location</th>
              <th className="px-2 py-3">Added</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {items.map((item) => (
              <tr key={item.id} className="text-[10px] hover:bg-slate-900/70">
                <td className="px-4 py-3 font-medium text-white"><div>{companyMode ? item.parentCompanyName || item.companyName : item.companyName}</div>{companyMode && item.parentCompanyName && <div className="text-[9px] text-slate-500">Source branch: {item.companyName}</div>}</td>
                <td className="px-2 py-3 text-violet-300">{companyMode ? `${item.branchCount || 1} managed ${(item.branchCount || 1) === 1 ? "location" : "locations"}` : "Owner / Manager"}</td>
                <td className="px-2 py-3 text-slate-400">{item.category || "—"}</td>
                <td className="px-2 py-3"><span className="px-2 py-1 rounded bg-violet-500/20 text-violet-200">{item.opportunity || "Target"}</span></td>
                <td className="px-2 py-3 text-emerald-400 font-semibold">{item.score || 0}</td>
                <td className="px-2 py-3 text-slate-400">{companyMode ? item.parentCompanyEmail || item.parentFounderEmail || item.email || "—" : item.email || "—"}</td>
                <td className="px-2 py-3 text-slate-400">{item.phone || "—"}</td>
                <td className="px-2 py-3 text-slate-400">{item.location || "—"}</td>
                <td className="px-2 py-3 text-slate-500">{new Date(item.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
