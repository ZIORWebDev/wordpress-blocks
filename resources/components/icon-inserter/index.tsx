/**
 * WordPress dependencies
 */
import type { ReactElement } from 'react';
import { useCallback, useRef } from '@wordpress/element';
import { Dashicon, ToolbarButton } from '@wordpress/components';
import { Inserter } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';
import { useDispatch, useSelect } from '@wordpress/data';

/**
 * Types
 */
type WPBlock = {
	name: string;
	clientId: string;
};

type InserterToggleRenderArgs = {
	onToggle: () => void;
	isOpen: boolean;
	disabled?: boolean;
};

type IconInserterProps = {
	rootClientId: string;
	label?: string;
	/**
	 * Accepts a Dashicon slug string (e.g. "admin-appearance") or a React element.
	 * We normalize to a React element before passing to ToolbarButton to satisfy typings.
	 */
	icon?: string | ReactElement;
	onSelectOrClose?: () => void;
};

export default function IconInserter({
	rootClientId,
	label = __('Add block'),
	icon = 'admin-appearance',
	onSelectOrClose,
}: IconInserterProps) {
	// Stable ref for inserter anchor (toolbar button).
	const buttonRef = useRef<HTMLButtonElement | null>(null);

	// Reactive inner blocks under rootClientId.
	const innerBlocks = useSelect(
		(select) =>
			((select('core/block-editor') as any).getBlocks(rootClientId) ?? []) as WPBlock[],
		[rootClientId]
	);

	const { removeBlock, insertBlock } = useDispatch('core/block-editor') as any;

	const handleSelect = useCallback(
		(block: any) => {
			// Remove existing icon blocks under this root.
			for (const b of innerBlocks) {
				if (b.name === 'zior/icon') removeBlock(b.clientId);
			}

			// Insert the newly selected block under the root.
			insertBlock(block, undefined, rootClientId);
		},
		[innerBlocks, insertBlock, removeBlock, rootClientId]
	);

	// Normalize icon to a React element to satisfy ToolbarButton's IconType typings.
	const toolbarIcon =
		typeof icon === 'string' ? <Dashicon icon={icon as any} /> : icon;

	return (
		<Inserter
			rootClientId={rootClientId}
			position="bottom center"
			__experimentalIsQuick={true}
			isAppender={true}
			anchorRef={buttonRef}
			onSelectOrClose={onSelectOrClose}
			renderToggle={({ onToggle, isOpen, disabled }: InserterToggleRenderArgs) => (
				<ToolbarButton
					icon={toolbarIcon}
					label={label}
					onClick={onToggle}
					aria-expanded={isOpen}
					disabled={disabled}
					ref={buttonRef}
				/>
			)}
			onSelect={handleSelect}
		/>
	);
}
