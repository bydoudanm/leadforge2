import { Button } from "@/components/ui/button";
import { ArrowLeft, BellRing, CheckCircle2, KeyRound, LayoutDashboard, LogOut, Menu, Save, Settings, UserRound } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { useLocation } from "wouter";

type User = {
  id: number;
  name: string | null;
  email: string;
  plan: string;
  emailAlertsEnabled: boolean;
  campaignAlertsEnabled: boolean;
  weeklyReportsEnabled: boolean;
  productUpdatesEnabled: boolean;
};

type ApiError = Error & { status?: number };

async function api<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(options?.headers ?? {}) },
    ...options,
  });
  if (!response.ok) {
    const error = new Error(`${response.status}:${await response.text()}`) as ApiError;
    error.status = response.status;
    throw error;
  }
  return response.json() as Promise<T>;
}

export default function ProfileSettings() {
  const [, setLocation] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [savingNotifications, setSavingNotifications] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notifications, setNotifications] = useState({
    emailAlertsEnabled: true,
    campaignAlertsEnabled: true,
    weeklyReportsEnabled: true,
    productUpdatesEnabled: false,
  });
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    api<User>("/api/profile")
      .then((nextUser) => {
        if (!active) return;
        setUser(nextUser);
        setName(nextUser.name ?? "");
        setEmail(nextUser.email);
        setNotifications({
          emailAlertsEnabled: nextUser.emailAlertsEnabled,
          campaignAlertsEnabled: nextUser.campaignAlertsEnabled,
          weeklyReportsEnabled: nextUser.weeklyReportsEnabled,
          productUpdatesEnabled: nextUser.productUpdatesEnabled,
        });
      })
      .catch((requestError: unknown) => {
        if (!active) return;
        const typedError = requestError as ApiError;
        if (typedError.status === 401 || typedError.message.startsWith("401:")) {
          setLocation("/login");
          return;
        }
        setError("Unable to load your profile. Please try again.");
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [setLocation]);

  const handleLogout = async () => {
    await api<{ success: boolean }>("/api/auth/logout", { method: "POST" });
    setLocation("/");
  };

  const handleProfileSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSavingProfile(true);
    setProfileMessage("");
    setError("");
    try {
      const updatedUser = await api<User>("/api/profile", {
        method: "PATCH",
        body: JSON.stringify({ name, email }),
      });
      setUser(updatedUser);
      setName(updatedUser.name ?? "");
      setEmail(updatedUser.email);
      setProfileMessage("Account details saved.");
    } catch (requestError: unknown) {
      const message = requestError instanceof Error ? requestError.message : "Unable to save account details";
      setProfileMessage(message.startsWith("409:") ? "That email is already in use." : "Unable to save account details.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleNotificationSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSavingNotifications(true);
    setNotificationMessage("");
    try {
      const updatedUser = await api<User>("/api/profile/notifications", {
        method: "PATCH",
        body: JSON.stringify(notifications),
      });
      setUser(updatedUser);
      setNotifications({
        emailAlertsEnabled: updatedUser.emailAlertsEnabled,
        campaignAlertsEnabled: updatedUser.campaignAlertsEnabled,
        weeklyReportsEnabled: updatedUser.weeklyReportsEnabled,
        productUpdatesEnabled: updatedUser.productUpdatesEnabled,
      });
      setNotificationMessage("Notification preferences saved.");
    } catch {
      setNotificationMessage("Unable to save notification preferences.");
    } finally {
      setSavingNotifications(false);
    }
  };

  const handlePasswordSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPasswordMessage("");
    if (newPassword !== confirmPassword) {
      setPasswordMessage("New passwords do not match.");
      return;
    }
    setSavingPassword(true);
    try {
      await api<{ success: boolean }>("/api/profile/password", {
        method: "POST",
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordMessage("Password changed successfully.");
    } catch (requestError: unknown) {
      const message = requestError instanceof Error ? requestError.message : "Unable to change password";
      if (message.startsWith("401:")) setPasswordMessage("Current password is incorrect.");
      else if (message.startsWith("400:")) setPasswordMessage(message.split(":").slice(1).join(":") || "Check your password details.");
      else setPasswordMessage("Unable to change password.");
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-slate-950 text-slate-200 grid place-items-center">Loading settings…</div>;
  }

  if (error && !user) {
    return <div className="min-h-screen bg-slate-950 text-red-300 grid place-items-center p-6">{error}</div>;
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
          <button onClick={() => setLocation("/dashboard")} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white text-left"><LayoutDashboard className="w-5 h-5" />{sidebarOpen && <span className="text-sm font-medium">Dashboard</span>}</button>
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30"><Settings className="w-5 h-5" />{sidebarOpen && <span className="text-sm font-medium">Settings</span>}</div>
        </nav>
        <div className="p-4 border-t border-slate-800"><Button onClick={handleLogout} className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center gap-2"><LogOut className="w-4 h-4" />{sidebarOpen && "Logout"}</Button></div>
      </aside>

      <main className="flex-1 min-w-0 overflow-auto">
        <header className="bg-slate-900 border-b border-slate-800 px-8 py-6 flex items-center justify-between sticky top-0 z-10">
          <div><h1 className="text-3xl font-bold text-white">Profile Settings</h1><p className="text-slate-400 text-sm mt-1">Manage your account details and security.</p></div>
          <button onClick={() => setSidebarOpen((open) => !open)} className="p-2 hover:bg-slate-800 rounded-lg" aria-label="Toggle sidebar"><Menu className="w-6 h-6 text-slate-400" /></button>
        </header>

        <div className="p-8 max-w-4xl space-y-6">
          <section className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-6">
            <div className="flex items-start gap-4 mb-6"><div className="w-11 h-11 rounded-xl bg-blue-500/20 grid place-items-center"><UserRound className="w-5 h-5 text-blue-400" /></div><div><h2 className="text-lg font-semibold text-white">Account details</h2><p className="text-sm text-slate-400 mt-1">Update the name and email address associated with your LeadForge account.</p></div></div>
            <form onSubmit={handleProfileSubmit} className="space-y-5 max-w-2xl">
              <label className="block"><span className="block text-sm text-slate-300 mb-2">Full name</span><input required value={name} onChange={(event) => setName(event.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-blue-500" /></label>
              <label className="block"><span className="block text-sm text-slate-300 mb-2">Email address</span><input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-blue-500" /></label>
              <div className="flex items-center gap-4"><Button disabled={savingProfile} className="bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-2"><Save className="w-4 h-4" />{savingProfile ? "Saving…" : "Save changes"}</Button>{profileMessage && <span className={`text-sm flex items-center gap-2 ${profileMessage.includes("saved") ? "text-emerald-400" : "text-amber-300"}`}>{profileMessage.includes("saved") && <CheckCircle2 className="w-4 h-4" />}{profileMessage}</span>}</div>
            </form>
          </section>

          <section className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-6">
            <div className="flex items-start gap-4 mb-6"><div className="w-11 h-11 rounded-xl bg-cyan-500/20 grid place-items-center"><BellRing className="w-5 h-5 text-cyan-400" /></div><div><h2 className="text-lg font-semibold text-white">Email notifications</h2><p className="text-sm text-slate-400 mt-1">Choose which email alerts you want to receive from LeadForge.</p></div></div>
            <form onSubmit={handleNotificationSubmit} className="space-y-1 max-w-2xl">
              <label className="flex items-start justify-between gap-6 rounded-lg px-4 py-4 hover:bg-slate-800/60 cursor-pointer"><span><span className="block text-sm font-medium text-slate-200">Account and security alerts</span><span className="block text-xs text-slate-500 mt-1">Important sign-in, password, and account activity notifications.</span></span><input type="checkbox" checked={notifications.emailAlertsEnabled} onChange={(event) => setNotifications((current) => ({ ...current, emailAlertsEnabled: event.target.checked }))} className="mt-1 h-4 w-4 accent-cyan-500" /></label>
              <label className="flex items-start justify-between gap-6 rounded-lg px-4 py-4 hover:bg-slate-800/60 cursor-pointer"><span><span className="block text-sm font-medium text-slate-200">Campaign activity</span><span className="block text-xs text-slate-500 mt-1">Updates about replies, campaign performance, and deliverability.</span></span><input type="checkbox" checked={notifications.campaignAlertsEnabled} onChange={(event) => setNotifications((current) => ({ ...current, campaignAlertsEnabled: event.target.checked }))} className="mt-1 h-4 w-4 accent-cyan-500" /></label>
              <label className="flex items-start justify-between gap-6 rounded-lg px-4 py-4 hover:bg-slate-800/60 cursor-pointer"><span><span className="block text-sm font-medium text-slate-200">Weekly performance reports</span><span className="block text-xs text-slate-500 mt-1">A weekly summary of leads, outreach, conversions, and revenue.</span></span><input type="checkbox" checked={notifications.weeklyReportsEnabled} onChange={(event) => setNotifications((current) => ({ ...current, weeklyReportsEnabled: event.target.checked }))} className="mt-1 h-4 w-4 accent-cyan-500" /></label>
              <label className="flex items-start justify-between gap-6 rounded-lg px-4 py-4 hover:bg-slate-800/60 cursor-pointer"><span><span className="block text-sm font-medium text-slate-200">Product updates</span><span className="block text-xs text-slate-500 mt-1">Occasional news about new LeadForge features and improvements.</span></span><input type="checkbox" checked={notifications.productUpdatesEnabled} onChange={(event) => setNotifications((current) => ({ ...current, productUpdatesEnabled: event.target.checked }))} className="mt-1 h-4 w-4 accent-cyan-500" /></label>
              <div className="flex items-center gap-4 pt-4"><Button disabled={savingNotifications} className="bg-cyan-600 hover:bg-cyan-500 text-white flex items-center gap-2"><Save className="w-4 h-4" />{savingNotifications ? "Saving…" : "Save notification settings"}</Button>{notificationMessage && <span className={`text-sm flex items-center gap-2 ${notificationMessage.includes("saved") ? "text-emerald-400" : "text-amber-300"}`}>{notificationMessage.includes("saved") && <CheckCircle2 className="w-4 h-4" />}{notificationMessage}</span>}</div>
            </form>
          </section>

          <section className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-6">
            <div className="flex items-start gap-4 mb-6"><div className="w-11 h-11 rounded-xl bg-purple-500/20 grid place-items-center"><KeyRound className="w-5 h-5 text-purple-400" /></div><div><h2 className="text-lg font-semibold text-white">Change password</h2><p className="text-sm text-slate-400 mt-1">Use a strong password to keep your client acquisition workspace protected.</p></div></div>
            <form onSubmit={handlePasswordSubmit} className="space-y-5 max-w-2xl">
              <label className="block"><span className="block text-sm text-slate-300 mb-2">Current password</span><input required type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-purple-500" /></label>
              <label className="block"><span className="block text-sm text-slate-300 mb-2">New password</span><input required minLength={8} type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-purple-500" placeholder="At least 8 characters" /></label>
              <label className="block"><span className="block text-sm text-slate-300 mb-2">Confirm new password</span><input required minLength={8} type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-purple-500" placeholder="Repeat your new password" /></label>
              <div className="flex items-center gap-4"><Button disabled={savingPassword} className="bg-purple-600 hover:bg-purple-500 text-white flex items-center gap-2"><KeyRound className="w-4 h-4" />{savingPassword ? "Updating…" : "Update password"}</Button>{passwordMessage && <span className={`text-sm ${passwordMessage.includes("successfully") ? "text-emerald-400" : "text-amber-300"}`}>{passwordMessage}</span>}</div>
            </form>
          </section>

          <div className="flex items-center gap-2 text-sm text-slate-500"><ArrowLeft className="w-4 h-4" /> <button onClick={() => setLocation("/dashboard")} className="hover:text-slate-300">Return to Dashboard</button>{user?.plan && <span className="ml-auto">Current plan: <span className="text-slate-300 capitalize">{user.plan.replaceAll("_", " ")}</span></span>}</div>
        </div>
      </main>
    </div>
  );
}
