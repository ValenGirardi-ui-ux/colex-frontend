"use client";

import { useCallback, useEffect, useState } from "react";
import { filterCompleteSavedAddresses } from "@/src/lib/user-address-form";
import { fetchUserAddresses } from "@/src/services/addresses";

export function useUserSavedAddresses() {
  const [loading, setLoading] = useState(true);
  const [hasSavedAddress, setHasSavedAddress] = useState(false);
  const [sessionMissing, setSessionMissing] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { getCurrentUser } = await import("@/src/services/auth");
      const user = await getCurrentUser();
      if (cancelled) return;
      if (!user) {
        setSessionMissing(true);
        setHasSavedAddress(false);
        setLoading(false);
        return;
      }
      setSessionMissing(false);
      const { addresses, error } = await fetchUserAddresses(user.id);
      if (cancelled) return;
      if (error) {
        setHasSavedAddress(false);
        setLoading(false);
        return;
      }
      setHasSavedAddress(filterCompleteSavedAddresses(addresses).length > 0);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  useEffect(() => {
    const onChange = () => reload();
    window.addEventListener("colex-addresses-changed", onChange);
    return () => window.removeEventListener("colex-addresses-changed", onChange);
  }, [reload]);

  return { loading, hasSavedAddress, sessionMissing, reload };
}

export function notifyUserAddressesChanged() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("colex-addresses-changed"));
  }
}
