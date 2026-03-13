import type { BlockConfiguration } from '@wordpress/blocks';

import initBlock from '../../utils/init-block';
import edit from './edit';
import save from './save';
import metadata from '../../../src/Blocks/AddToCart/block.json';

export type ProductValue = {
  id: string;
  label: string;
};

export type ProductAttributes = {
  showQuantity?: boolean;
  quantity?: number;
  showProductSelector?: boolean;
  product?: ProductValue;
};

export const name = metadata.name;

export const settings = {
  ...metadata,
  icon: 'cart',
  edit,
  save,
} as unknown as BlockConfiguration<ProductAttributes>;

export const init = () => {
  if ( ! ZIORWPBlocks.isWCInstalled ) {
    return;
  }

  initBlock({ name, metadata, settings });
};