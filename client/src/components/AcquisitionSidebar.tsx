import {
  ArrowLeft,
  BarChart3,
  Building2,
  Mail,
  Menu,
  Search,
  Settings,
  Target,
  Users,
} from "lucide-react";

type AcquisitionMode = "individual" | "company" | "none";

type AcquisitionSidebarProps = {
  activeMode: AcquisitionMode;
  expanded: boolean;
  onToggle: () => void;
  onNavigate: (path: string) => void;
  onLogout: () => void;
};

const searchItems = [
  { mode: "individual" as const, icon: Search, label: "Lead Search", context: "Individual", path: "/lead-search" },
  { mode: "company" as const, icon: Building2, label: "Company Lead Search", context: "Company", path: "/company-lead-search" },
];

export default function AcquisitionSidebar({ activeMode, expanded, onToggle, onNavigate, onLogout }: AcquisitionSidebarProps) {
  return (
    <aside className={`${expanded ? "w-56" : "w-16"} hidden md:flex shrink-0 bg-[#06101c] border-r border-slate-800/80 flex-col transition-all`}>
      <div className="p-3 border-b border-slate-800/80">
        <button onClick={onToggle} className="w-full flex items-center justify-center py-2 rounded-lg hover:bg-slate-800/70 text-slate-400" aria-label={expanded ? "Collapse acquisition navigation" : "Expand acquisition navigation"}>
          <Menu className="w-4 h-4" />{expanded && <span className="ml-2 text-xs">Collapse</span>}
        </button>
      </div>
      <nav className="flex-1 p-3 space-y-1" aria-label="Acquisition navigation">
        {searchItems.map(({ mode, icon: Icon, label, context, path }) => (
          <button
            key={mode}
            onClick={() => onNavigate(path)}
            title={expanded ? undefined : `${label} · ${context}`}
            aria-current={activeMode === mode ? "page" : undefined}
            className={`w-full flex items-center ${expanded ? "justify-start px-3" : "justify-center px-2"} gap-3 py-2.5 rounded-lg text-left text-xs ${activeMode === mode ? "bg-violet-600/15 text-violet-300 border border-violet-500/30" : "text-slate-500 hover:bg-slate-800/70 hover:text-slate-200"}`}
          >
            <Icon className="w-4 h-4 shrink-0" />
            {expanded && <span className="min-w-0"><span className="block truncate">{label}</span><span className="block text-[9px] text-slate-500">{context} mode</span></span>}
          </button>
        ))}
        <button onClick={() => onNavigate("/dashboard")} className={`${expanded ? "justify-start px-3" : "justify-center px-2"} w-full flex items-center gap-3 py-2.5 rounded-lg text-left text-xs text-slate-500 hover:bg-slate-800/70 hover:text-slate-200`}><Users className="w-4 h-4 shrink-0" />{expanded && <span>Leads</span>}</button>
        <button onClick={() => onNavigate("/outreach")} className={`${expanded ? "justify-start px-3" : "justify-center px-2"} w-full flex items-center gap-3 py-2.5 rounded-lg text-left text-xs text-slate-500 hover:bg-slate-800/70 hover:text-slate-200`}><Mail className="w-4 h-4 shrink-0" />{expanded && <span>Outreach</span>}</button>
        <button className={`${expanded ? "justify-start px-3" : "justify-center px-2"} w-full flex items-center gap-3 py-2.5 rounded-lg text-left text-xs text-slate-500 hover:bg-slate-800/70 hover:text-slate-200`}><Target className="w-4 h-4 shrink-0" />{expanded && <span>Opportunities</span>}</button>
        <button className={`${expanded ? "justify-start px-3" : "justify-center px-2"} w-full flex items-center gap-3 py-2.5 rounded-lg text-left text-xs text-slate-500 hover:bg-slate-800/70 hover:text-slate-200`}><BarChart3 className="w-4 h-4 shrink-0" />{expanded && <span>Reports</span>}</button>
        <button onClick={() => onNavigate("/settings")} className={`${expanded ? "justify-start px-3" : "justify-center px-2"} w-full flex items-center gap-3 py-2.5 rounded-lg text-left text-xs text-slate-500 hover:bg-slate-800/70 hover:text-slate-200`}><Settings className="w-4 h-4 shrink-0" />{expanded && <span>Settings</span>}</button>
      </nav>
      <div className="p-3 border-t border-slate-800/80">
        <button onClick={onLogout} className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs text-slate-500 hover:bg-slate-800 hover:text-white"><ArrowLeft className="w-4 h-4 rotate-180" />{expanded && "Logout"}</button>
      </div>
    </aside>
  );
}
