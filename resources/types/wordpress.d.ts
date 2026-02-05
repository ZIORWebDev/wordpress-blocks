import type { ComponentType, MutableRefObject } from 'react';

/**
 * Global WordPress runtime object
 * (provided by WP core, not by TypeScript)
 */
declare const wp: {
	blockEditor?: Record<string, any>;
	data?: Record<string, any>;
	element?: Record<string, any>;
	components?: Record<string, any>;
	i18n?: Record<string, any>;
};

/**
 * Augment @wordpress/block-editor Inserter typing
 */
declare module '@wordpress/block-editor' {
	type BlockInstanceLike = any;

	export type InserterAugmentedProps = {
		rootClientId?: string;
		position?: string;
		isAppender?: boolean;

		// Missing in some @types versions but exists at runtime
		__experimentalIsQuick?: boolean;
		anchorRef?: MutableRefObject<HTMLElement | null>;
		onSelectOrClose?: () => void;
		onSelect?: (block: BlockInstanceLike) => void;

		renderToggle?: (args: {
			onToggle: () => void;
			isOpen: boolean;
			disabled?: boolean;
		}) => JSX.Element;
	};

	// Override the exported Inserter component typing
	export const Inserter: ComponentType<InserterAugmentedProps>;
}
