import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "../auth/supabase";

export function ParentAccount() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let mounted = true;
    void supabase.auth.getUser().then(({ data, error }) => {
      if (mounted) { setUser(error ? null : data.user); setLoading(false); }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) { setUser(session?.user ?? null); setLoading(false); }
    });
    return () => { mounted = false; subscription.unsubscribe(); };
  }, []);

  const sendLink = async () => {
    if (!email.trim() || busy) return;
    setBusy(true); setMessage("");
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: window.location.origin + window.location.pathname }
    });
    setMessage(error ? error.message : "Check your email for a secure sign-in link. Open it in this browser.");
    setBusy(false);
  };

  return (
    <section className="mt-4 rounded-2xl border-2 border-[#d6c4f5] bg-[#f7f0ff] p-4 text-left">
      <h3 className="text-lg font-extrabold text-[#48316e]">Parent account (sandbox)</h3>
      {loading ? <p className="mt-2 text-sm">Checking parent sign-in…</p> : user ? (
        <>
          <p className="mt-2 text-sm">Signed in as <strong>{user.email}</strong></p>
          <p className="mt-2 text-xs">Parent sign-in is connected. Subscription migration is not enabled yet; signing in does not transfer the earlier anonymous sandbox purchase.</p>
          <button type="button" className="mt-3 rounded-xl bg-[#7750f7] px-4 py-2 font-bold text-white" onClick={() => { void supabase.auth.signOut().then(({ error }) => setMessage(error ? error.message : "Signed out.")); }}>Sign out</button>
        </>
      ) : (
        <>
          <p className="mt-2 text-sm">Grown-ups: enter your email to receive a secure sign-in link. Children do not need an account.</p>
          <form className="mt-3 flex flex-col gap-2" onSubmit={e => { e.preventDefault(); void sendLink(); }}>
            <label className="text-sm font-bold" htmlFor="parent-email">Parent email</label>
            <input id="parent-email" type="email" required autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full rounded-xl border border-[#b6a4dc] bg-white p-3 text-[#48316e]" placeholder="parent@example.com" />
            <button type="submit" disabled={busy} className="rounded-xl bg-[#7750f7] px-4 py-3 font-bold text-white disabled:opacity-60">{busy ? "Sending…" : "Email me a sign-in link"}</button>
          </form>
        </>
      )}
      {message && <p role="status" className="mt-2 text-sm">{message}</p>}
    </section>
  );
}
