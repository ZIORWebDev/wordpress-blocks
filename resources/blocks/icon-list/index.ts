import type { BlockConfiguration } from '@wordpress/blocks';

import initBlock from '../../utils/init-block';
import edit from './edit';
import save from './save';
import metadata from '../../../src/Blocks/IconList/block.json';

export type Attributes = {
  listType?: 'ul' | 'ol';
};

export const name = metadata.name;

export const settings = {
  ...metadata,
  example: {
    innerBlocks: [
      {
        name: 'zior/icon-picker',
        attributes: {},
      },
      {
        name: 'core/paragraph',
        attributes: {
          placeholder: 'Add content...',
        },
      },
    ],
  },
  icon: 'editor-ul',
  edit,
  save,
} as unknown as BlockConfiguration<Attributes>;

export const init = () => initBlock({ name, metadata, settings });

