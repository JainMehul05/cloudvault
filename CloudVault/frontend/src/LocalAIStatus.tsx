import { useCallback, useEffect, useState } from "react";
import { api } from "./api";
export default function LocalAIStatus() {
  const [state, setState] = useState<{
      available: boolean;
      model: string;
      reason?: string;
      busy: boolean;
    } | null>(null),
    [error, setError] = useState("");
  const refresh = useCallback(async () => {
    try {
      setState(await api("/ai/status"));
      setError("");
    } catch (e) {
      setError((e as Error).message);
    }
  }, []);
  useEffect(() => {
    void refresh();
  }, [refresh]);
  return (
    <div className="local-ai-diagnostic">
      <div>
        <span className={"model-status " + (state?.available ? "ready" : "")}>
          <span />
          {state
            ? state.available
              ? "Model installed · " +
                (state.busy
                  ? "Preparing an answer"
                  : "Ready for local inference")
              : "Generation unavailable"
            : "Checking local inference…"}
        </span>
        <button className="text-button" onClick={() => void refresh()}>
          Check AI status
        </button>
      </div>
      {(error || state?.reason) && (
        <p className="caption">{error || state?.reason}</p>
      )}
    </div>
  );
}
