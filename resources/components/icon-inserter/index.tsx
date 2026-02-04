/**
 * WordPress dependencies
 */
import { useCallback, useMemo } from '@wordpress/element';
import { ToolbarButton } from '@wordpress/components';
import { Inserter } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';
import { select, dispatch } from '@wordpress/data';

type InserterToggleRenderProps = {
  onToggle: () => void;
  isOpen: boolean;
  disabled?: boolean;
  toggleProps?: Record<string, unknown>;
};

type WPBlock = {
  clientId: string;
  name: string;
};

type IconInserterProps = {
  rootClientId: string;
  label?: string;
  icon?: string | object;
  onSelectOrClose?: () => void;
  singletonBlockName?: string;
};

const STORE = 'core/block-editor' as const;

export default function IconInserter({
  rootClientId,
  label,
  icon,
  onSelectOrClose,
  singletonBlockName = 'zior/icon',
}: IconInserterProps) {
  const buttonLabel = useMemo(() => label ?? __('Add block'), [label]);
  const buttonIcon = useMemo(() => icon ?? 'admin-appearance', [icon]);

  const handleSelect = useCallback(
    (block: WPBlock) => {
      const editorSelect = select(STORE) as any;
      const editorDispatch = dispatch(STORE) as any;

      const innerBlocks: WPBlock[] = editorSelect.getBlocks(rootClientId) ?? [];
      const idsToRemove = innerBlocks
        .filter((b) => b.name === singletonBlockName)
        .map((b) => b.clientId);

      if (idsToRemove.length) {
        if (typeof editorDispatch.removeBlocks === 'function') {
          editorDispatch.removeBlocks(idsToRemove);
        } else {
          idsToRemove.forEach((id) => editorDispatch.removeBlock(id));
        }
      }

      editorDispatch.insertBlock(block, undefined, rootClientId);
    },
    [rootClientId, singletonBlockName]
  );

  return (
    <Inserter
      rootClientId={rootClientId}
      isAppender
      renderToggle={({ onToggle, isOpen, disabled, toggleProps }: InserterToggleRenderProps) => (
        <ToolbarButton
          {...(toggleProps as any)}
          icon={buttonIcon as any}
          label={buttonLabel}
          onClick={onToggle}
          aria-expanded={isOpen}
          disabled={disabled}
        />
      )}
      onSelect={handleSelect}
    />
  );
}
