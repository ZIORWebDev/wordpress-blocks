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
import metadata from '../../../src/blocks/AddToCart/block.json';

const { name } = metadata;

export { metadata, name };

export const settings = {
  icon: 'cart',
  edit,
  save
};

export const init = () => initBlock({ name, metadata, settings });
