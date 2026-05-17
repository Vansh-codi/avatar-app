// // components/ui/Providers.tsx
// 'use client';

// import { useEffect } from 'react';
// import { useStore } from '@/lib/store';
// import type { ReactNode } from 'react';
// export function Providers({ children }: { children: ReactNode }) {
//   const { theme } = useStore();

//   useEffect(() => {
//     document.documentElement.setAttribute('data-theme', theme);
//   }, [theme]);

//   return <>{children}</>;
// }

'use client';

import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { SessionProvider } from 'next-auth/react';
import { useStore } from '@/lib/store';

export function Providers({ children }: { children: ReactNode }) {
  const { theme } = useStore();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return <SessionProvider>{children}</SessionProvider>;
}