/**
 * WordPress dependencies
 */
const {
  i18n: { __ },
} = wp;

/**
 * Internal dependencies
 */
import initBlock from '../../utils/init-block';
import edit from './edit';
import save from './save';
import metadata from '../../../src/blocks/Icon/block.json';
import variations from './variations';

const { name } = metadata;

export { metadata, name };

export const settings = {
  icon: 'color-picker',
  edit,
  save,
  variations,
};

export const init = () => initBlock({ name, metadata, settings });
