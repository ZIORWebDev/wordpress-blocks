/**
 * Internal dependencies
 */
import initBlock from '../../utils/init-block';
import edit from './edit';
import metadata from '../../../src/blocks/IconList/block.json';
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
  icon: 'editor-ul',
  edit,
  save,
};

export const init = () => initBlock({ name, metadata, settings });
