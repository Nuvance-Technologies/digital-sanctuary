import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import type { Session } from "@supabase/supabase-js";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
  head: () => ({ meta: [{ title: "Admin — Shri Meera Mai Ashram" }, { name: "robots", content: "noindex" }] }),
});

function AdminLayout() {
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const { location } = useRouterState();

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) { setIsAdmin(null); return; }
    supabase.from("user_roles").select("role").eq("user_id", session.user.id).eq("role", "admin").maybeSingle().then(({ data }) => setIsAdmin(!!data));
  }, [session]);

  if (!session) return <LoginForm />;
  if (isAdmin === null) return <div className="px-4 py-20 text-center text-muted-foreground">…</div>;
  if (!isAdmin) return (
    <div className="mx-auto max-w-md px-4 py-20 text-center">
      <Card className="glass border-0 p-8">
        <h2 className="font-serif text-2xl">Not authorised</h2>
        <p className="mt-2 text-sm text-muted-foreground">This account is not on the admin whitelist.</p>
        <Button className="mt-4" onClick={() => supabase.auth.signOut()}>Sign out</Button>
      </Card>
    </div>
  );

  const tabs = [
    { to: "/admin", label: "Gallery" },
    { to: "/admin/events", label: "Events" },
    { to: "/admin/rsvps", label: "RSVPs" },
    { to: "/admin/donations", label: "Donations" },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="glass mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl p-4">
        <div className="flex flex-wrap gap-1">
          {tabs.map((t) => (
            <Link key={t.to} to={t.to} className={`rounded-lg px-3 py-1.5 text-sm ${location.pathname === t.to ? "bg-primary text-primary-foreground" : "hover:bg-primary/10"}`}>{t.label}</Link>
          ))}
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-muted-foreground">{session.user.email}</span>
          <Button size="sm" variant="outline" onClick={() => supabase.auth.signOut()}>Sign out</Button>
        </div>
      </div>
      <Outlet />
    </div>
  );
}

function LoginForm() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    const fn = mode === "login" ? supabase.auth.signInWithPassword({ email, password }) : supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin + "/admin" } });
    const { error } = await fn;
    setBusy(false);
    if (error) toast.error(error.message);
    else if (mode === "signup") toast.success("Account created. Check your email to verify, then sign in.");
  };

  return (
    <div className="mx-auto max-w-md px-4 py-20">
      <Card className="glass border-0 p-8">
        <h1 className="font-serif text-3xl">Admin Access</h1>
        <p className="mt-1 text-sm text-muted-foreground">Only whitelisted emails are granted admin rights.</p>
        <div className="mt-6 space-y-3">
          <div><Label>Email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
          <div><Label>Password</Label><Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} /></div>
          <Button onClick={submit} disabled={busy} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">{mode === "login" ? "Sign in" : "Create account"}</Button>
          <button className="w-full text-xs text-muted-foreground hover:text-primary" onClick={() => setMode(mode === "login" ? "signup" : "login")}>
            {mode === "login" ? "Need an account? Sign up" : "Already have one? Sign in"}
          </button>
        </div>
      </Card>
    </div>
  );
}
