/**
 * External dependencies
 */
import { clsx } from 'clsx';

/**
 * WordPress dependencies (use global `wp` instead of module imports)
 */
import { RichText, useBlockProps } from '@wordpress/block-editor';

/**
 * Types
 */
type TextAlign = 'left' | 'center' | 'right' | 'justify' | undefined;

interface BlockAttributes {
	textAlign?: TextAlign;
	content?: string;
}

interface SaveProps {
	attributes: BlockAttributes;
}

/**
 * Save function
 */
export default function Save({ attributes }: SaveProps) {
	const { textAlign, content = '' } =
		attributes;

	const props = useBlockProps.save({
		className
	});

	return (
		<HtmlTag {...props}>
			<RichText.Content value={content} />
		</HtmlTag>
	);
}
