/**
 * External dependencies
 */
import clsx from 'clsx';

/**
 * WordPress dependencies
 */
/* WordPress dependencies (use global `wp` instead of module imports) */
const { RichText, useBlockProps } = wp.blockEditor;

export default function save( { attributes } ) {
	const { textAlign, content, level } = attributes;
	const TagName = 'h' + level;

	const className = clsx( {
		[ `has-text-align-${ textAlign }` ]: textAlign,
	} );

	return (
		<TagName { ...useBlockProps.save( { className } ) }>
			<RichText.Content value={ content } />
		</TagName>
	);
}
