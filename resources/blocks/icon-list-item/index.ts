/**
 * Internal dependencies
 */
import initBlock from '../../utils/init-block';
import edit from './edit';
import metadata from '../../../src/Blocks/IconListItem/block.json';
import save from './save';

import type { BlockConfiguration } from '@wordpress/blocks';

export type Attributes = {
};

const { name } = metadata;

export { metadata, name };

export const settings: BlockConfiguration<Attributes> = {
  ...metadata, // Provides title, category, attributes, etc.
  example: {
    innerBlocks: [
      { name: 'zior/icon-picker', attributes: {} },
      { name: 'core/paragraph', attributes: { placeholder: 'Add content...' } },
    ],
  },
  icon: 'minus',
  edit,
  save,
};

export const init = () => initBlock({ name, metadata, settings });
