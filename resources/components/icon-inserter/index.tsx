/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { useRef } from '@wordpress/element';
import { ToolbarButton } from '@wordpress/components';
import { Inserter } from '@wordpress/block-editor';
import { dispatch, select } from '@wordpress/data';
import type { BlockInstance } from '@wordpress/blocks';
import type { IconType } from '@wordpress/components';

type Props = {
	/** Parent block clientId (the block that owns the icon inner block). */
	rootClientId: string;
	/** Toolbar button label. */
	label?: string;
	/** Toolbar button icon (Dashicon slug, Icon component, or SVG). */
	icon?: IconType;
	/** Called when a block is inserted OR the inserter popover is closed. */
	onSelectOrClose?: () => void;
	/** Which block name to treat as the “icon block” to replace. */
	iconBlockName?: string;
};

const STORE = 'core/block-editor' as const;

export default function IconInserter( {
	rootClientId,
	label = __( 'Change Icon', 'wordpress-blocks' ),
	icon = 'admin-appearance',
	onSelectOrClose,
	iconBlockName = 'zior/icon',
}: Props ) {
	// Anchor for the inserter popover (ToolbarButton is rendered as a button-like element).
	const buttonRef = useRef<HTMLElement | null>( null );

	return (
		<Inserter
			rootClientId={ rootClientId }
			position="bottom center"
			__experimentalIsQuick={ true }
			isAppender={ true }
			anchorRef={ buttonRef }
			onSelectOrClose={ onSelectOrClose }
			renderToggle={ ( { onToggle, isOpen, disabled } ) => (
				<ToolbarButton
					icon={ icon }
					label={ label }
					onClick={ onToggle }
					aria-expanded={ isOpen }
					disabled={ disabled }
					// ToolbarButton's ref typing can be looser across WP versions; this is the safest.
					ref={ buttonRef as unknown as React.Ref<HTMLButtonElement> }
				/>
			) }
			onSelect={ ( block: BlockInstance ) => {
				// Remove existing icon blocks inside the parent (Icon Picker) block.
				const innerBlocks = select( STORE ).getBlocks(
					rootClientId
				) as BlockInstance[];

				innerBlocks.forEach( ( b ) => {
					if ( b?.name === iconBlockName ) {
						dispatch( STORE ).removeBlock( b.clientId );
					}
				} );

				// Insert the new selected block into the parent.
				dispatch( STORE ).insertBlock( block, undefined, rootClientId );
			} }
		/>
	);
}
