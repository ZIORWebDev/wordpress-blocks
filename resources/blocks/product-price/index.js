
/**
 * Internal dependencies
 */
import initBlock from '../../utils/init-block';
import edit from './edit';
import metadata from '../../../src/blocks/ProductPrice/block.json';
import save from './save';

const { name } = metadata;

export { metadata, name };

export const settings = {
  icon: 'money-alt',
  edit,
  save,
};

export const init = () => initBlock({ name, metadata, settings });