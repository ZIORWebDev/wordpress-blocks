/**
 * Wordpress dependencies
 */
import { __ } from '@wordpress/i18n';
import type { BlockConfiguration } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import initBlock from '../../utils/init-block';
import edit from './edit';
import metadata from '../../../src/Blocks/Icon/block.json';
import variations from './variations';
import save from './save';

const { name } = metadata;

export { metadata, name };

type AnyAttrs = Record<string, unknown>;

type Settings = {
};

export const settings: Settings = {
  icon: 'color-picker',
  edit,
  save,
  variations,
};

export const init = (): unknown =>
  initBlock({
    name,
    metadata,
    // initBlock wants BlockConfiguration, but that type may require title/category/attributes
    // (which are already supplied by metadata). Cast at the boundary.
    settings: settings as unknown as BlockConfiguration<AnyAttrs>,
  });

