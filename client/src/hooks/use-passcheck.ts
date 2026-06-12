import { useState, useEffect, useRef } from "react";
import { checkHIBP, type BreachStatus } from "@/lib/password";

export function useDebounced<T>(value: T, delay = 350) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

export function useBreachCheck(password: string, enabled: boolean) {
  const [status, setStatus] = useState<BreachStatus>("unknown");
  const [count, setCount] = useState(0);
  const debounced = useDebounced(password, 500);
  const reqId = useRef(0);

  useEffect(() => {
    if (!enabled || !debounced) {
      setStatus("unknown");
      setCount(0);
      return;
    }
    const id = ++reqId.current;
    setStatus("checking");
    checkHIBP(debounced)
      .then((c) => {
        if (id !== reqId.current) return;
        setCount(c);
        setStatus(c > 0 ? "breached" : "safe");
      })
      .catch(() => {
        if (id !== reqId.current) return;
        setStatus("unknown");
      });
  }, [debounced, enabled]);

  return { status, count };
}
