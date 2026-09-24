import { useEffect, useState, useCallback } from "react";
import { AppState } from "react-native";
import { getBatteryLevel, isMonitoring } from "../services/nativeBridge";

// Polls the native module only while the app is foregrounded (the
// background case is already handled by the native service directly —
// this hook is purely for the in-app UI display, not for triggering alerts).
export function useBatteryLevel(pollMs = 5000) {
  const [level, setLevel] = useState(null);
  const [monitoring, setMonitoring] = useState(false);

  const refresh = useCallback(async () => {
    const [lvl, running] = await Promise.all([getBatteryLevel(), isMonitoring()]);
    setLevel(lvl);
    setMonitoring(running);
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, pollMs);
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") refresh();
    });
    return () => {
      clearInterval(interval);
      sub.remove();
    };
  }, [refresh, pollMs]);

  return { level, monitoring, refresh };
}
