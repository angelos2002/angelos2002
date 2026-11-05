"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { Overrides } from "@/lib/locations";

const Ctx = createContext<{ overrides: Overrides; refresh: () => void }>({ overrides: {}, refresh: () => {} });

/** Polls staff overrides (open / closed / paused order types) once a minute. */
export function StoreStatusProvider({ children }: { children: React.ReactNode }) {
  const [overrides, setOverrides] = useState<Overrides>({});
  const refresh = useCallback(() => {
    fetch("/api/store-status", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setOverrides(d.overrides ?? {}))
      .catch(() => {});
  }, []);
  useEffect(() => {
    refresh();
    const id = window.setInterval(refresh, 60_000);
    const onFocus = () => refresh();
    window.addEventListener("focus", onFocus);
    return () => {
      window.clearInterval(id);
      window.removeEventListener("focus", onFocus);
    };
  }, [refresh]);
  return <Ctx.Provider value={{ overrides, refresh }}>{children}</Ctx.Provider>;
}

export function useStoreOverrides() {
  return useContext(Ctx);
}
