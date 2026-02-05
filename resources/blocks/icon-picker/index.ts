import type { BlockConfiguration } from '@wordpress/blocks';

import initBlock from '../../utils/init-block';
import edit from './edit';
import save from './save';
import deprecated from './deprecated';
import metadata from '../../../src/Blocks/IconPicker/block.json';

export type IconPickerAttributes = {
	// adjust to your actual attributes
	// (keeping it minimal here)
};

export const name = metadata.name;

/**
 * `metadata` already includes required properties:
 * - title
 * - category
 * - attributes
 * (and more)
 */
export const settings: BlockConfiguration<IconPickerAttributes> = {
	...metadata,
	example: {
		innerBlocks: [
			{
				name: 'zior/icon',
				attributes: { service: 'wordpress', url: 'https://wordpress.org' },
			},
			{
				name: 'zior/icon',
				attributes: {
					service: 'facebook',
					url: 'https://www.facebook.com/WordPress/',
				},
			},
			{
				name: 'zior/icon',
				attributes: { service: 'twitter', url: 'https://twitter.com/WordPress' },
			},
		],
	},
	icon: 'admin-customizer',
	edit,
	save,
	deprecated,
};

export const init = () => initBlock({ name, metadata, settings });
