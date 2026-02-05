/**
 * External dependencies
 */
import { clsx } from 'clsx';

/**
 * WordPress dependencies
 */
import { InnerBlocks, useBlockProps } from '@wordpress/block-editor';

type IconPickerAttributesV1 = {
	className?: string;
	layout?: {
		type?: string;
		justifyContent?: string;
		[key: string]: unknown;
	};
	itemsJustification?: string;
	size?: string;

	iconColorValue?: string;
	iconBackgroundColorValue?: string;
};

type DeprecatedSaveProps = {
	attributes: IconPickerAttributesV1;
};

/**
 * The specific handling by `className` below is needed because `itemsJustification`
 * was introduced in https://github.com/WordPress/gutenberg/pull/28980/files and wasn't
 * declared in block.json.
 */
const migrateWithLayout = (
	attributes: IconPickerAttributesV1,
): IconPickerAttributesV1 => {
	if ( attributes.layout ) {
		return attributes;
	}

	const { className } = attributes;

	// Matches classes with `items-justified-` prefix.
	const prefix = 'items-justified-';
	const justifiedItemsRegex = new RegExp( `\\b${ prefix }[^ ]*[ ]?\\b`, 'g' );

	const nextClassName =
		typeof className === 'string'
			? className.replace( justifiedItemsRegex, '' ).trim()
			: className;

	const newAttributes: IconPickerAttributesV1 = {
		...attributes,
		className: nextClassName,
	};

	/**
	 * Add `layout` prop only if `justifyContent` is defined, for backwards
	 * compatibility. In other cases the block's default layout will be used.
	 * Also noting that due to the missing attribute, it's possible for a block
	 * to have more than one of `justified` classes.
	 */
	const justifyClass = className?.match( justifiedItemsRegex )?.[ 0 ]?.trim();
	if ( justifyClass ) {
		newAttributes.layout = {
			type: 'flex',
			justifyContent: justifyClass.slice( prefix.length ),
		};
	}

	return newAttributes;
};

const deprecated = [
	// V1. Remove CSS variable use for colors.
	{
		attributes: {
			iconColor: { type: 'string' },
			customIconColor: { type: 'string' },
			iconColorValue: { type: 'string' },
			iconBackgroundColor: { type: 'string' },
			customIconBackgroundColor: { type: 'string' },
			iconBackgroundColorValue: { type: 'string' },
			openInNewTab: { type: 'boolean', default: false },
			size: { type: 'string' },
		},
		providesContext: {
			openInNewTab: 'openInNewTab',
		},
		supports: {
			align: [ 'left', 'center', 'right' ],
			anchor: true,
		},
		migrate: migrateWithLayout,
		save: ( props: DeprecatedSaveProps ) => {
			const {
				iconBackgroundColorValue,
				iconColorValue,
				itemsJustification,
				size,
			} = props.attributes;

			const className = clsx( size, {
				'has-icon-color': !! iconColorValue,
				'has-icon-background-color': !! iconBackgroundColorValue,
				[ `items-justified-${ itemsJustification }` ]: !! itemsJustification,
			} );

			const style = {
				// legacy CSS variables used in deprecated markup:
				'--wp--icon-picker--icon-color': iconColorValue,
				'--wp--icon-picker--icon-background-color': iconBackgroundColorValue,
			} as React.CSSProperties;

			return (
				<ul { ...useBlockProps.save( { className, style } ) }>
					<InnerBlocks.Content />
				</ul>
			);
		},
	},
] as const;

export default deprecated;
