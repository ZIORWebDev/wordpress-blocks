/**
 * WordPress dependencies
 */
const { 
	i18n: { __ }
} = wp;
import { widget as icon } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import initBlock from '../../utils/init-block';
import edit from './edit';
// import save from './save';
import metadata from '../../../php/blocks/icon/block.json';
import variations from './variations';

const { name } = metadata;

export { metadata, name };

export const settings = {
	icon,
	edit,
	// save,
	variations,
};

if ( window.__experimentalContentOnlyPatternInsertion ) {
	settings.fields = [
		{
			label: __( 'Link' ),
			type: 'Link',
			shownByDefault: true,
			mapping: {
				href: 'url',
				rel: 'rel',
			},
		},
		{
			label: __( 'Label' ),
			type: 'RichText',
			shownByDefault: false,
			mapping: {
				value: 'label',
			},
		},
	];
}

export const init = () => initBlock( { name, metadata, settings } );
