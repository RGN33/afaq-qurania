import { useState, useEffect, useCallback } from 'react';

export function useSavedResources() {
  const [savedIds, setSavedIds] = useState<string[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('afaq-saved-resources');
    if (stored) {
      setSavedIds(JSON.parse(stored));
    }
  }, []);

  const toggleSave = useCallback((resourceId: string) => {
    setSavedIds((prev) => {
      const newIds = prev.includes(resourceId)
        ? prev.filter((id) => id !== resourceId)
        : [...prev, resourceId];
      localStorage.setItem('afaq-saved-resources', JSON.stringify(newIds));
      return newIds;
    });
  }, []);

  const isSaved = useCallback(
    (resourceId: string) => savedIds.includes(resourceId),
    [savedIds]
  );

  return { savedIds, toggleSave, isSaved };
}
