/**
 * Internal dependencies
 */
import type { BlockConfiguration } from '@wordpress/blocks';

import initBlock from '../../utils/init-block';
import edit from './edit';
import metadata from '../../../src/Blocks/IconList/block.json';
import save from './save';

const { name } = metadata;

export { metadata, name };

type AnyAttrs = Record<string, unknown>;

type Settings = {
  icon: string;
  edit: unknown;
  save: unknown;
};

export const settings: Settings = {
  icon: 'editor-ul',
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

