// app/KonstaProvider.tsx
'use client'; // This directive isolates client state safely

import { App } from 'konsta/react';

export default function KonstaProvider({ children }: { children: React.ReactNode }) {
  return (
    // 'theme' can be 'ios', 'material', or 'parent' for auto-detection
    <App theme="ios" safeAreas>
      {children}
    </App>
  );
}
