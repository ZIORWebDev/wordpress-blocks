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

type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

interface LinkAttributeShape {
	url?: string;
}

interface BlockAttributes {
	textAlign?: TextAlign;
	content?: string;
	level?: HeadingLevel | number;
	tagName?: string;
	saveContent?: boolean;
	link?: LinkAttributeShape;
	url?: string;
}

interface SaveProps {
	attributes: BlockAttributes;
}

/**
 * Save function
 */
export default function Save({ attributes }: SaveProps) {
	const { textAlign, level = 2, tagName } =
		attributes;

	// Keep original behavior: tagName overrides, otherwise "h" + level.
	// (We keep it as a string because Gutenberg supports custom tags too.)
	const HtmlTag = (tagName && tagName.length ? tagName : `h${level}`) as keyof JSX.IntrinsicElements;

	const className = clsx({
		[`has-text-align-${textAlign}`]: !!textAlign,
	});

	const props = useBlockProps.save({
		className: className
	});

	return (
		<HtmlTag {...props}><span data-zior-placeholder-price></span></HtmlTag>
	);
}
