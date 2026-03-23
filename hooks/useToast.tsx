"use client";

import { useState, useCallback } from "react";

interface UseToastReturn {
  toast: string | null;
  showToast: (msg: string, duration?: number) => void;
}

export function useToast(): UseToastReturn {
  const [toast, setToast] = useState<string | null>(null);

  const showToast = useCallback((msg: string, duration = 2600): void => {
    setToast(msg);
    setTimeout(() => setToast(null), duration);
  }, []);

  return { toast, showToast };
}