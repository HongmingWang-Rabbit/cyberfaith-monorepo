"use client";

import { AuthProvider } from "@cyberfaith/auth-client";

export function AuthWrapper({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider coreApiUrl={process.env.NEXT_PUBLIC_CORE_API_URL}>
      {children}
    </AuthProvider>
  );
}
