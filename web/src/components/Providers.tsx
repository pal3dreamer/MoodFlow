'use client';

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";
import { AuthGate } from "./AuthGate";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <AuthGate>{children}</AuthGate>
    </SessionProvider>
  );
}
