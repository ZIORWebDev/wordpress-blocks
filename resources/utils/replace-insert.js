const { useEffect } = wp.element;
const { select, subscribe, dispatch } = wp.data;

export function useReplaceIconOnInsert(rootClientId) {
  useEffect(() => {
    const unsubscribe = subscribe(() => {
      const innerBlocks = select('core/block-editor').getBlocks(rootClientId);

      // Check if more than one icon exists
      const iconBlocks = innerBlocks.filter((b) => b.name === 'zior/icon');
      if (iconBlocks.length > 1) {
        // Keep only the last inserted icon
        const [...toRemove] = iconBlocks.slice(0, -1);
        toRemove.forEach((b) => {
          dispatch('core/block-editor').removeBlock(b.clientId);
        });
      }
    });

    return () => unsubscribe();
  }, [rootClientId]);
}
