import { useState, useEffect, useCallback } from 'react';
import { getAllEntries } from './storage';

// Shared by the hero section and the waitlist form so both show the same
// number and update together right after someone submits the form.
export default function useWaitlistCount() {
  const [count, setCount] = useState(null); // null while loading

  const refresh = useCallback(async () => {
    try {
      const entries = await getAllEntries();
      setCount(entries.length);
      return entries.length;
    } catch (e) {
      console.warn('No se pudo leer la lista de espera', e);
      return null;
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { count, refresh };
}
