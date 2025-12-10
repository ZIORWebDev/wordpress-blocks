/**
 * Internal dependencies
 */
import initBlock from '../../utils/init-block';
import edit from './edit';
import metadata from '../../../php/blocks/IconListItem/block.json';
import save from './save';

const { name } = metadata;

export { metadata, name };

export const settings = {
  example: {
    innerBlocks: [
      {
        name: 'ziorwebdev/icon-picker',
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
  save,
};

export const init = () => initBlock({ name, metadata, settings });
