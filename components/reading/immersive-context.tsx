"use client";

import { createContext, useContext, useState, useCallback } from "react";

type ImmersiveContextValue = {
  immersive: boolean;
  toggle: () => void;
};

const ImmersiveContext = createContext<ImmersiveContextValue | null>(null);

export function ImmersiveProvider({ children }: { children: React.ReactNode }) {
  const [immersive, setImmersive] = useState(false);

  const toggle = useCallback(() => {
    setImmersive(v => !v);
  }, []);

  return (
    <ImmersiveContext.Provider value={{ immersive, toggle }}>
      {children}
    </ImmersiveContext.Provider>
  );
}

export function useImmersive() {
  const ctx = useContext(ImmersiveContext);
  if (!ctx) {
    throw new Error("useImmersive must be used within ImmersiveProvider");
  }
  return ctx;
}