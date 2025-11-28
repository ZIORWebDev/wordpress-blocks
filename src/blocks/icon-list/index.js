/**
 * WordPress dependencies
 */
import { tool as icon } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import initBlock from '../../utils/init-block';
import deprecated from './deprecated';
import edit from './edit';
import metadata from '../../../php/blocks/icon-picker/block.json';
import save from './save';
console.log("metadata", metadata);
const { name } = metadata;

export { metadata, name };

export const settings = {
	example: {
		innerBlocks: [
			{
				name: 'ziorwebdev/icon',
				attributes: {
					service: 'wordpress',
					url: 'https://wordpress.org',
				},
			},
			{
				name: 'ziorwebdev/icon',
				attributes: {
					service: 'facebook',
					url: 'https://www.facebook.com/WordPress/',
				},
			},
			{
				name: 'ziorwebdev/icon',
				attributes: {
					service: 'twitter',
					url: 'https://twitter.com/WordPress',
				},
			},
		],
	},
	icon,
	edit,
	save,
	deprecated,
};

export const init = () => initBlock( { name, metadata, settings } );
