import { Button } from "@/components/ui/button";
import { ArrowLeft, LockKeyhole, Sparkles } from "lucide-react";
import { FormEvent, useState } from "react";
import { Link, useLocation } from "wouter";

async function submitAuth(path: string, body: Record<string, string>) {
  const response = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error || "Unable to complete authentication");
  return payload;
}

export function Auth({ mode }: { mode: "login" | "signup" }) {
  const [, setLocation] = useLocation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isSignup = mode === "signup";
  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await submitAuth(`/api/auth/${mode}`, isSignup ? { name, email, password } : { email, password });
      setLocation("/dashboard");
    } catch (requestError: unknown) {
      setError(requestError instanceof Error ? requestError.message : "Unable to complete authentication");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.22),transparent_42%),radial-gradient(circle_at_bottom_left,rgba(6,182,212,0.12),transparent_36%)]" />
      <div className="relative max-w-6xl mx-auto px-6 py-8">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm"><ArrowLeft className="w-4 h-4" /> Back to LeadForge</Link>
        <div className="min-h-[calc(100vh-96px)] grid place-items-center py-12">
          <div className="w-full max-w-md bg-slate-900/80 border border-slate-700/70 rounded-2xl p-8 shadow-2xl shadow-blue-950/20 backdrop-blur">
            <div className="flex items-center gap-3 mb-8"><div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 grid place-items-center"><Sparkles className="w-5 h-5 text-white" /></div><div><p className="font-bold text-lg">LeadForge</p><p className="text-xs text-slate-400">Your client acquisition command center</p></div></div>
            <div className="mb-8"><h1 className="text-3xl font-bold">{isSignup ? "Start closing more clients" : "Welcome back"}</h1><p className="text-slate-400 mt-2">{isSignup ? "Create your account and open your free trial dashboard." : "Sign in to continue to your client acquisition dashboard."}</p></div>
            <form onSubmit={onSubmit} className="space-y-5">
              {isSignup && <label className="block"><span className="block text-sm text-slate-300 mb-2">Full name</span><input required value={name} onChange={(event) => setName(event.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-blue-500" placeholder="Alex Morgan" /></label>}
              <label className="block"><span className="block text-sm text-slate-300 mb-2">Email</span><input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-blue-500" placeholder="you@company.com" /></label>
              <label className="block"><span className="block text-sm text-slate-300 mb-2">Password</span><input required minLength={isSignup ? 8 : 1} type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-blue-500" placeholder={isSignup ? "At least 8 characters" : "Your password"} /></label>
              {error && <p role="alert" className="text-sm text-red-300 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3">{error}</p>}
              <Button disabled={submitting} className="w-full bg-blue-600 hover:bg-blue-500 text-white py-6">{submitting ? "Working…" : isSignup ? "Create free account" : "Sign in"}</Button>
            </form>
            <div className="mt-6 flex items-center gap-2 text-sm text-slate-400"><LockKeyhole className="w-4 h-4" /> Your session is protected with a secure HttpOnly cookie.</div>
            <p className="text-center text-sm text-slate-400 mt-8">{isSignup ? "Already have an account?" : "New to LeadForge?"} <Link href={isSignup ? "/login" : "/signup"} className="text-blue-400 hover:text-blue-300">{isSignup ? "Sign in" : "Create an account"}</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Login() { return <Auth mode="login" />; }
export function Signup() { return <Auth mode="signup" />; }
