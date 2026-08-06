import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type OAuthResult = {
  data: any;
  error: { message: string } | null;
};

type OAuthNamespace = {
  getAuthorizationDetails: (id: string) => Promise<OAuthResult>;
  approveAuthorization: (id: string) => Promise<OAuthResult>;
  denyAuthorization: (id: string) => Promise<OAuthResult>;
};

const oauth = () =>
  (supabase.auth as unknown as { oauth: OAuthNamespace }).oauth;

export default function OAuthConsent() {
  const [params] = useSearchParams();
  const authorizationId = params.get("authorization_id") ?? "";

  const [checkingSession, setCheckingSession] = useState(true);
  const [hasSession, setHasSession] = useState(false);
  const [details, setDetails] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    let active = true;
    (async () => {
      if (!authorizationId) {
        setCheckingSession(false);
        setError("Richiesta non valida: manca authorization_id.");
        return;
      }
      const { data: sess } = await supabase.auth.getSession();
      if (!active) return;
      setHasSession(Boolean(sess.session));
      setCheckingSession(false);
      if (!sess.session) return;

      const { data, error: detailsError } = await oauth().getAuthorizationDetails(authorizationId);
      if (!active) return;
      if (detailsError) {
        setError(detailsError.message);
        return;
      }
      const immediate = data?.redirect_url ?? data?.redirect_to;
      if (immediate && !data?.client) {
        window.location.href = immediate;
        return;
      }
      setDetails(data);
    })();
    return () => {
      active = false;
    };
  }, [authorizationId, hasSession]);

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (signInError) {
      setError(signInError.message);
      return;
    }
    setHasSession(true);
  }

  async function decide(approve: boolean) {
    setBusy(true);
    setError(null);
    const { data, error: decideError } = approve
      ? await oauth().approveAuthorization(authorizationId)
      : await oauth().denyAuthorization(authorizationId);
    if (decideError) {
      setBusy(false);
      setError(decideError.message);
      return;
    }
    const target = data?.redirect_url ?? data?.redirect_to;
    if (!target) {
      setBusy(false);
      setError("Nessun URL di reindirizzamento restituito dal server di autorizzazione.");
      return;
    }
    window.location.href = target;
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-foreground">
          Collega un'applicazione a OCTOWONDERS.COM
        </h1>

        {error && (
          <p className="mt-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</p>
        )}

        {checkingSession && <p className="mt-4 text-sm text-muted-foreground">Caricamento…</p>}

        {!checkingSession && !hasSession && (
          <form className="mt-6 space-y-4" onSubmit={signIn}>
            <p className="text-sm text-muted-foreground">
              Accedi con il tuo account per continuare con l'autorizzazione.
            </p>
            <div className="space-y-2">
              <Label htmlFor="oauth-email">Email</Label>
              <Input
                id="oauth-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="oauth-password">Password</Label>
              <Input
                id="oauth-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={busy}>
              {busy ? "Accesso…" : "Accedi"}
            </Button>
          </form>
        )}

        {!checkingSession && hasSession && !details && !error && (
          <p className="mt-4 text-sm text-muted-foreground">Caricamento della richiesta…</p>
        )}

        {details && (
          <div className="mt-6 space-y-4">
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">{details.client?.name ?? "L'applicazione"}</strong>{" "}
              potrà usare gli strumenti di questo sito al posto tuo, con i tuoi permessi.
            </p>
            {details.client?.redirect_uri && (
              <p className="break-all text-xs text-muted-foreground">
                Redirect: {details.client.redirect_uri}
              </p>
            )}
            {details.scope && (
              <p className="text-xs text-muted-foreground">Permessi richiesti: {details.scope}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Questo non aggira le regole di accesso ai dati del sito.
            </p>
            <div className="flex gap-3">
              <Button className="flex-1" disabled={busy} onClick={() => decide(true)}>
                Approva
              </Button>
              <Button
                className="flex-1"
                variant="outline"
                disabled={busy}
                onClick={() => decide(false)}
              >
                Annulla
              </Button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
