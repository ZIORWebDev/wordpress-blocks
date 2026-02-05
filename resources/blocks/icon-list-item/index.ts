/**
 * Internal dependencies
 */
import type { BlockConfiguration, BlockDeprecation } from '@wordpress/blocks';

import initBlock from '../../utils/init-block';
import edit from './edit';
import metadata from '../../../src/Blocks/IconListItem/block.json';
import save from './save';

const { name } = metadata;

export { metadata, name };

type AnyAttrs = Record<string, unknown>;

type ExampleInnerBlock = {
  name: string;
  attributes?: AnyAttrs;
  innerBlocks?: ExampleInnerBlock[];
};

type Settings = {
  example: {
    innerBlocks: ExampleInnerBlock[];
  };
  icon: string;
  edit: unknown;
  save: unknown;
  deprecated?: readonly BlockDeprecation<AnyAttrs, Record<string, any>>[];
};

export const settings: Settings = {
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
  icon: 'minus',
  edit,
  save
};

export const init = (): unknown =>
  initBlock({
    name,
    metadata,
    // initBlock wants BlockConfiguration, but that type may require title/category/attributes
    // (which are already supplied by metadata). Cast at the boundary.
    settings: settings as unknown as BlockConfiguration<AnyAttrs>,
  });
