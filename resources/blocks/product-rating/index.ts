
/**
 * Internal dependencies
 */
import initBlock from '../../utils/init-block';
import edit from './edit';
import metadata from '../../../src/blocks/ProductRating/block.json';
import save from './save';

const { name } = metadata;

export { metadata, name };

export const settings = {
  icon: 'star-half',
  edit,
  save,
};

export const init = () => {
  if ( ! ZIORWPBlocks.isWCInstalled ) {
    return;
  }

  initBlock({ name, metadata, settings });
};