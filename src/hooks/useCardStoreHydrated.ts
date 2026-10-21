import { useEffect, useState } from 'react';
import { useCardStore } from '@/store';

/** Wait until card-storage has rehydrated from localStorage. */
export function useCardStoreHydrated() {
  const [hydrated, setHydrated] = useState(() => useCardStore.persist.hasHydrated());

  useEffect(() => {
    if (useCardStore.persist.hasHydrated()) {
      setHydrated(true);
      return;
    }

    return useCardStore.persist.onFinishHydration(() => {
      setHydrated(true);
    });
  }, []);

  return hydrated;
}
