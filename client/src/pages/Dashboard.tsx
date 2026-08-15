import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ArrowRight, Inbox, LogOut, Mail, Menu, Target, TrendingUp, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import ThemeToggle from "@/components/ThemeToggle";

type User = { id: number; name: string | null; email: string; plan: string };
type Lead = {
  id: number;
  companyName: string;
  industry: string | null;
  status: "new" | "contacted" | "interested" | "qualified" | "converted" | "lost";
  score: number | null;
};
type Stats = {
  leads: { total: number; newCount: number; contacted: number; converted: number };
  campaigns: { total: number; active: number };
  opportunities: { total: number; wonValue: number };
};
type AnalyticsPoint = { date: string; revenue: string | number; leadsDiscovered: number; emailsSent: number };

const COLORS = ["#3b82f6", "#06b6d4", "#8b5cf6"];

async function api<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(options?.headers ?? {}) },
    ...options,
  });
  if (!response.ok) throw new Error(`${response.status}:${await response.text()}`);
  return response.json() as Promise<T>;
}

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    Promise.all([
      api<User>("/api/auth/me"),
      api<Stats>("/api/dashboard/stats"),
      api<Lead[]>("/api/dashboard/leads?limit=10"),
      api<AnalyticsPoint[]>("/api/dashboard/analytics?days=30"),
    ])
      .then(([nextUser, nextStats, nextLeads, nextAnalytics]) => {
        if (!active) return;
        setUser(nextUser);
        setStats(nextStats);
        setLeads(nextLeads);
        setAnalytics(nextAnalytics);
      })
      .catch((requestError: unknown) => {
        if (!active) return;
        const message = requestError instanceof Error ? requestError.message : "Unable to load dashboard";
        if (message.startsWith("401:")) setLocation("/login");
        else setError(message);
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [setLocation]);

  const analyticsChartData = useMemo(
    () => [...analytics].reverse().map((item) => ({
      date: new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      revenue: Number(item.revenue) || 0,
    })),
    [analytics],
  );

  const leadStatusData = useMemo(() => [
    { name: "New", value: stats?.leads.newCount ?? 0 },
    { name: "Contacted", value: stats?.leads.contacted ?? 0 },
    { name: "Converted", value: stats?.leads.converted ?? 0 },
  ], [stats]);

  const handleLogout = async () => {
    await api<{ success: boolean }>("/api/auth/logout", { method: "POST" });
    setLocation("/");
  };

  if (loading) {
    return <div className="min-h-screen bg-slate-950 text-slate-200 grid place-items-center">Loading command center…</div>;
  }

  if (error || !user || !stats) {
    return <div className="min-h-screen bg-slate-950 text-red-300 grid place-items-center p-6">{error || "Dashboard data is unavailable."}</div>;
  }

  return (
    <div className="flex min-h-screen bg-slate-950">
      <aside className={`${sidebarOpen ? "w-64" : "w-20"} shrink-0 bg-slate-900 border-r border-slate-800 transition-all duration-300 flex flex-col`}>
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center"><span className="text-white font-bold">⚡</span></div>
            {sidebarOpen && <span className="text-white font-bold text-lg">LeadForge</span>}
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {[{ icon: "📊", label: "Dashboard", href: "/dashboard" }, { icon: "🔎", label: "Lead Search · Individual", href: "/lead-search" }, { icon: "🏢", label: "Company Lead Search · Company", href: "/company-lead-search" }, { icon: "👥", label: "Leads" }, { icon: "📧", label: "Campaigns" }, { icon: <Inbox className="w-4 h-4" />, label: "Inbox", href: "/inbox" }, { icon: "📈", label: "Analytics" }, { icon: "🎯", label: "Opportunities" }, { icon: "⚙️", label: "Settings", href: "/settings" }].map((item) => (
            <button key={item.label} onClick={() => item.href && setLocation(item.href)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left ${item.label === "Dashboard" ? "bg-blue-600/20 text-blue-400 border border-blue-500/30" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}>
              <span className="text-lg">{item.icon}</span>{sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-800">
          <Button onClick={handleLogout} className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center gap-2"><LogOut className="w-4 h-4" />{sidebarOpen && "Logout"}</Button>
        </div>
      </aside>

      <main className="flex-1 min-w-0 overflow-auto">
        <header className="bg-slate-900 border-b border-slate-800 px-8 py-6 flex items-center justify-between sticky top-0 z-10">
          <div><h1 className="text-3xl font-bold text-white">Dashboard</h1><p className="text-slate-400 text-sm mt-1">Welcome back, {user.name || user.email}</p></div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button onClick={() => setSidebarOpen((open) => !open)} className="p-2 hover:bg-slate-800 rounded-lg"><Menu className="w-6 h-6 text-slate-400" /></button>
          </div>
        </header>

        <div className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            <Card className="bg-slate-900/50 border-slate-700/50 p-6"><div className="flex items-center justify-between"><div><p className="text-slate-400 text-sm font-medium">Total Leads</p><p className="text-3xl font-bold text-white mt-2">{stats.leads.total}</p><p className="text-blue-400 text-xs mt-2">+{stats.leads.newCount} new</p></div><div className="w-12 h-12 bg-blue-500/20 rounded-lg grid place-items-center"><Users className="w-6 h-6 text-blue-400" /></div></div></Card>
            <Card className="bg-slate-900/50 border-slate-700/50 p-6"><div className="flex items-center justify-between"><div><p className="text-slate-400 text-sm font-medium">Campaigns</p><p className="text-3xl font-bold text-white mt-2">{stats.campaigns.total}</p><p className="text-cyan-400 text-xs mt-2">{stats.campaigns.active} active</p></div><div className="w-12 h-12 bg-cyan-500/20 rounded-lg grid place-items-center"><Mail className="w-6 h-6 text-cyan-400" /></div></div></Card>
            <Card className="bg-slate-900/50 border-slate-700/50 p-6"><div className="flex items-center justify-between"><div><p className="text-slate-400 text-sm font-medium">Opportunities</p><p className="text-3xl font-bold text-white mt-2">{stats.opportunities.total}</p><p className="text-purple-400 text-xs mt-2">${Number(stats.opportunities.wonValue).toLocaleString()}</p></div><div className="w-12 h-12 bg-purple-500/20 rounded-lg grid place-items-center"><Target className="w-6 h-6 text-purple-400" /></div></div></Card>
            <Card className="bg-slate-900/50 border-slate-700/50 p-6"><div className="flex items-center justify-between"><div><p className="text-slate-400 text-sm font-medium">Conversion Rate</p><p className="text-3xl font-bold text-white mt-2">{stats.leads.total ? Math.round((stats.leads.converted / stats.leads.total) * 100) : 0}%</p><p className="text-green-400 text-xs mt-2">{stats.leads.converted} converted</p></div><div className="w-12 h-12 bg-green-500/20 rounded-lg grid place-items-center"><TrendingUp className="w-6 h-6 text-green-400" /></div></div></Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="bg-slate-900/50 border-slate-700/50 p-6 lg:col-span-2"><h3 className="text-lg font-semibold text-white mb-4">Revenue Trend</h3><ResponsiveContainer width="100%" height={300}><LineChart data={analyticsChartData}><CartesianGrid strokeDasharray="3 3" stroke="#334155" /><XAxis dataKey="date" stroke="#94a3b8" /><YAxis stroke="#94a3b8" /><Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569" }} /><Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} dot={false} /></LineChart></ResponsiveContainer></Card>
            <Card className="bg-slate-900/50 border-slate-700/50 p-6"><h3 className="text-lg font-semibold text-white mb-4">Lead Status</h3><ResponsiveContainer width="100%" height={300}><PieChart><Pie data={leadStatusData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">{leadStatusData.map((entry, index) => <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />)}</Pie><Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569" }} /></PieChart></ResponsiveContainer></Card>
          </div>

          <Card className="bg-slate-900/50 border-slate-700/50 p-6"><div className="flex items-center justify-between mb-6"><h3 className="text-lg font-semibold text-white">Recent Leads</h3><Button className="bg-blue-600 hover:bg-blue-700 text-white text-sm">View All</Button></div><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-slate-700"><th className="text-left py-3 px-4 text-slate-400 font-medium">Company</th><th className="text-left py-3 px-4 text-slate-400 font-medium">Industry</th><th className="text-left py-3 px-4 text-slate-400 font-medium">Status</th><th className="text-left py-3 px-4 text-slate-400 font-medium">Score</th><th className="text-left py-3 px-4 text-slate-400 font-medium">Action</th></tr></thead><tbody>{leads.length ? leads.map((lead: Lead) => <tr key={lead.id} className="border-b border-slate-800"><td className="py-4 px-4 text-white font-medium">{lead.companyName}</td><td className="py-4 px-4 text-slate-400">{lead.industry || "—"}</td><td className="py-4 px-4"><span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400">{lead.status}</span></td><td className="py-4 px-4 text-white">{lead.score ?? 0}</td><td className="py-4 px-4"><button className="text-blue-400 flex items-center gap-1">View <ArrowRight className="w-4 h-4" /></button></td></tr>) : <tr><td colSpan={5} className="py-8 text-center text-slate-400">No leads yet. Start by discovering leads.</td></tr>}</tbody></table></div></Card>
        </div>
      </main>
    </div>
  );
}
