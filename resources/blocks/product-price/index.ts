
/**
 * Internal dependencies
 */
import initBlock from '../../utils/init-block';
import edit from './edit';
import metadata from '../../../src/Blocks/ProductPrice/block.json';
import save from './save';

const { name } = metadata;

export { metadata, name };

export type ProductValue = {
  id: string;
  label: string;
  price?: string;
};

export type ProductAttributes = {
	textAlign?: string;
	content?: string;
	placeholder?: string;
	anchor?: string;
	tagName?: string;
	helpText?: string;
	product?: ProductValue;
	showProductSelector?: boolean;
};

export const settings = {
  icon: 'money-alt',
  edit,
  save,
};

export const init = () => {
  if ( ! ZIORWPBlocks.isWCInstalled ) {
    return;
  }

  initBlock({ name, metadata, settings });
};