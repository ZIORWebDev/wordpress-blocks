/**
 * WordPress dependencies
 */
import type { BlockConfiguration } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import initBlock from '../../utils/init-block';
import edit from './edit';
import metadata from '../../../src/Blocks/ProductRating/block.json';
import save from './save';

const { name } = metadata;

export { metadata, name };

declare const ZIORWPBlocks: {
	isWCInstalled?: boolean;
};

export type ProductValue = {
	id: string;
	label: string;
	rating?: string;
};

export type ProductAttributes = {
	textAlign?: 'left' | 'center' | 'right';
	content?: string;
	placeholder?: string;
	anchor?: string;
	tagName?: string;
	helpText?: string;
	product?: ProductValue;
	showProductSelector?: boolean;
};

type BlockSettings = Omit<
	BlockConfiguration<ProductAttributes>,
	'name' | 'title' | 'category' | 'attributes'
>;

export const settings: BlockSettings = {
	icon: 'star-half',
	edit,
	save,
};

export const init = (): void => {
	if (!ZIORWPBlocks?.isWCInstalled) {
		return;
	}

	initBlock({ name, metadata, settings });
};