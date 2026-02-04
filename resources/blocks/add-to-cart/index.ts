import type { BlockConfiguration } from '@wordpress/blocks';

import initBlock from '../../utils/init-block';
import edit from './edit';
import save from './save';
import metadata from '../../../src/Blocks/AddToCart/block.json';

export type Attributes = {
  productId?: string | number;
  showQuantity?: boolean;
  quantity?: number;
};

export const name = metadata.name;

/**
 * `metadata` already includes the required properties:
 * - title
 * - category
 * - attributes
 * (and more: supports, example, usesContext, etc.)
 */
export const settings: BlockConfiguration<Attributes> = {
  ...metadata,
  icon: 'cart',
  edit,
  save,
};

export const init = () => initBlock({ name, metadata, settings });
