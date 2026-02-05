import { useEffect } from '@wordpress/element';
import { select, subscribe, dispatch } from '@wordpress/data';

type ClientId = string;

type WPBlock = {
  clientId: ClientId;
  name: string;
};

type BlockEditorSelect = {
  getBlocks: (rootClientId?: ClientId) => WPBlock[];
};

type BlockEditorDispatch = {
  removeBlock: (clientId: ClientId) => void;
};

export function useReplaceIconOnInsert(rootClientId?: ClientId): void {
  useEffect(() => {
    if (!rootClientId) return;

    let prevIconClientIds: ClientId[] = [];

    const unsubscribe = subscribe(() => {
      const blocks =
        (select('core/block-editor') as unknown as BlockEditorSelect).getBlocks(rootClientId) ?? [];

      const iconClientIds = blocks
        .filter((b) => b?.name === 'zior/icon')
        .map((b) => b.clientId);

      if (iconClientIds.length <= 1) {
        prevIconClientIds = iconClientIds;
        return;
      }

      const sameAsPrev =
        iconClientIds.length === prevIconClientIds.length &&
        iconClientIds.every((id, i) => id === prevIconClientIds[i]);

      if (sameAsPrev) return;

      prevIconClientIds = iconClientIds;

      const idsToRemove = iconClientIds.slice(0, -1);
      const editorDispatch = dispatch('core/block-editor') as unknown as BlockEditorDispatch;

      for (let i = idsToRemove.length - 1; i >= 0; i--) {
        editorDispatch.removeBlock(idsToRemove[i]);
      }
    });

    return () => unsubscribe();
  }, [rootClientId]);
}
