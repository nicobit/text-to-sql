// src/auth/useAuthZ.ts
import { useEffect, useState } from "react";
import { IPublicClientApplication } from "@azure/msal-browser";
import { loginRequest } from "@/authConfig";
import { decodeJwt, JwtClaims } from "./jwt";
import { useMsal } from "@azure/msal-react";

export function useAuthZ(instance: IPublicClientApplication) {
  const [ready, setReady] = useState(false);
  const [claims, setClaims] = useState<JwtClaims | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await instance.acquireTokenSilent(loginRequest);
        if (!alive) return;
        setToken(res.accessToken);
        setClaims(decodeJwt(res.accessToken));
      } catch {
        // not signed-in or consent missing
      } finally {
        if (alive) setReady(true);
      }
    })();
    return () => { alive = false; };
  }, [instance]);

  const roles = claims?.roles ?? [];
  const isAdmin = roles.includes("Admin");

  return { ready, token, claims, roles, isAdmin };
}

// Use this hook inside a React component instead of a standalone function
// Example usage: const { isAdmin } = useAuthZ(instance);
// Removed isAdmin() function to avoid useMsal() outside React context


export function AdminOnly({ children }: { children: React.ReactNode }) {
  const { instance } = useMsal();
  const { ready, isAdmin } = useAuthZ(instance); // use instance from MSAL context
  if (!ready) return null; // or a skeleton
  return isAdmin ? <>{children}</> : null;
}