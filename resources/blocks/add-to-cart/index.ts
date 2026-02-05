import type { BlockConfiguration } from '@wordpress/blocks';

import initBlock from '../../utils/init-block';
import edit from './edit';
import save from './save';
import metadata from '../../../src/Blocks/AddToCart/block.json';

export type Attributes = {
  productId?: string;
  showQuantity?: boolean;
  quantity?: number;
};

export const name = metadata.name;

export const settings = {
  ...metadata,
  icon: 'cart',
  edit,
  save,
} as unknown as BlockConfiguration<Attributes>;

export const init = () => initBlock({ name, metadata, settings });
