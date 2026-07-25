'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';

export function AppLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLandingPage = pathname === '/';

  if (isLandingPage) {
    return (
      <div className="min-h-screen w-full bg-[#fcfcfd] flex flex-col overflow-y-auto">
        <main className="w-full flex-1 flex flex-col min-w-0">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background">
      <Sidebar />
      <main className="flex-1 flex flex-col h-full min-w-0 bg-background overflow-hidden">
        {children}
      </main>
    </div>
  );
}
