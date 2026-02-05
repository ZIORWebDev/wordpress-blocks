import type { BlockConfiguration, BlockVariation } from '@wordpress/blocks';
import { registerBlockVariation } from '@wordpress/blocks';

import initBlock from '../../utils/init-block';
import edit from './edit';
import save from './save';
import metadata from '../../../src/Blocks/Icon/block.json';
import variations from './variations';

export type Attributes = {
  // your attributes...
};

export const name = metadata.name as string;
export { metadata };

export const settings: BlockConfiguration<Attributes> = {
  ...metadata,
  icon: 'color-picker',
  edit,
  save,
};

export const init = () => {
  initBlock({ name, metadata, settings });

  // Register variations after the block is registered
  (variations as BlockVariation[]).forEach((variation) => {
    registerBlockVariation(name, variation);
  });
};
