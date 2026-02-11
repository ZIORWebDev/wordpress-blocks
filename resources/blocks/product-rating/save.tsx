/**
 * External dependencies
 */
import { clsx } from 'clsx';

/**
 * WordPress dependencies
 */
import { RichText, useBlockProps } from '@wordpress/block-editor';

/**
 * Save function
 */
export default function Save({ attributes }) {
	const {
		textAlign,
		content = '',
	} = attributes;

	const props = useBlockProps.save({
		className: clsx(
			'woocommerce',
			{
				[`has-text-align-${textAlign}`]: !!textAlign,
			}
		),
	});


	return (
		<div {...props}>
			<span data-zior-placeholder-rating></span>
		</div>
	);
}
