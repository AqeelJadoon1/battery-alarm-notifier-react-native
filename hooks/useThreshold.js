import { useEffect, useState, useCallback } from "react";
import { getThreshold, saveThreshold } from "../storage/thresholdStorage";
import { pushThresholdToService } from "../services/nativeBridge";
import { DEFAULTS } from "../constants/channels";

export function useThreshold() {
  const [value, setValue] = useState(DEFAULTS.THRESHOLD_PERCENT);
  const [saved, setSaved] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    getThreshold().then((v) => {
      setValue(v);
      setLoaded(true);
    });
  }, []);

  const commit = useCallback(async (newValue) => {
    const clamped = await saveThreshold(newValue);
    setValue(clamped);
    await pushThresholdToService(clamped);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }, []);

  return { value, setValue, commit, saved, loaded };
}