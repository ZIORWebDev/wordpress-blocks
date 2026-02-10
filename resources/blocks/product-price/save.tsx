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
	const { textAlign, content = '', level = 2, tagName, saveContent = true, link, url } =
		attributes;

	// Keep original behavior: tagName overrides, otherwise "h" + level.
	// (We keep it as a string because Gutenberg supports custom tags too.)
	const HtmlTag = (tagName && tagName.length ? tagName : `h${level}`) as keyof JSX.IntrinsicElements;

	// When saveContent is false, return an empty wrapper tag (no RichText content),
	// but still preserve block props.
	if (!saveContent) {
		return <HtmlTag {...useBlockProps.save()} />;
	}

	const className = clsx({
		[`has-text-align-${textAlign}`]: !!textAlign,
	});

	// Persist link URL as a data attribute for server-side usage.
	const linkUrl = link?.url ?? url ?? '';

	const props = useBlockProps.save({
		className,
		'data-link-url': linkUrl,
	});

	return (
		<HtmlTag {...props}>
			<RichText.Content value={content} />
		</HtmlTag>
	);
}
