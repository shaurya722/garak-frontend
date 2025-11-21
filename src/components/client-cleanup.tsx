'use client';

import { useEffect } from 'react';

export default function ClientCleanup() {
  useEffect(() => {
    document.body.removeAttribute('cz-shortcut-listen');
  }, []);

  return null; // This component doesn't render anything
}
