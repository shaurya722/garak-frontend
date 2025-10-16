'use client';

import { useEffect } from 'react';

export default function ClientCleanup() {
  useEffect(() => {
    // Remove any attributes added by browser extensions that cause hydration mismatches
    document.body.removeAttribute('cz-shortcut-listen');
  }, []);

  return null; // This component doesn't render anything
}
