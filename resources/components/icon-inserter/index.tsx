/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { useRef, type Element } from '@wordpress/element';
import { ToolbarButton } from '@wordpress/components';
import { Inserter } from '@wordpress/block-editor';
import { dispatch, select } from '@wordpress/data';
import type { BlockInstance } from '@wordpress/blocks';

type Props = {
	rootClientId: string;
	label?: string;
	icon?: string | Element | ((props: Record<string, unknown>) => Element);
	onSelectOrClose?: () => void;
};

type InserterToggleProps = {
	onToggle: () => void;
	isOpen: boolean;
	disabled?: boolean;
};

export default function IconInserter({
	rootClientId,
	label = __('Change Icon', 'wordpress-blocks'),
	icon = 'admin-appearance',
	onSelectOrClose,
}: Props) {
	const buttonRef = useRef<HTMLElement | null>(null);

	return (
		<Inserter
			rootClientId={rootClientId}
			position="bottom center"
			__experimentalIsQuick
			isAppender
			anchorRef={buttonRef}
			onSelectOrClose={onSelectOrClose}
			renderToggle={({ onToggle, isOpen, disabled }: InserterToggleProps) => (
				<ToolbarButton
					icon={icon}
					label={label}
					onClick={onToggle}
					aria-expanded={isOpen}
					disabled={disabled}
					ref={buttonRef}
				/>
			)}
			onSelect={(block: BlockInstance) => {
				const innerBlocks = select('core/block-editor').getBlocks(
					rootClientId
				) as BlockInstance[];

				innerBlocks.forEach((b) => {
					if (b.name === 'zior/icon') {
						dispatch('core/block-editor').removeBlock(b.clientId);
					}
				});

				dispatch('core/block-editor').insertBlock(
					block,
					undefined,
					rootClientId
				);

				onSelectOrClose?.();
			}}
		/>
	);
}
