/**
 * Internal dependencies
 */
import initBlock from '../../utils/init-block';
import deprecated from './deprecated';
import edit from './edit';
import metadata from '../../../src/blocks/IconPicker/block.json';
import save from './save';

const { name } = metadata;

export { metadata, name };

export const settings = {
  example: {
    innerBlocks: [
      {
        name: 'zior/icon',
        attributes: {
          service: 'wordpress',
          url: 'https://wordpress.org',
        },
      },
      {
        name: 'zior/icon',
        attributes: {
          service: 'facebook',
          url: 'https://www.facebook.com/WordPress/',
        },
      },
      {
        name: 'zior/icon',
        attributes: {
          service: 'twitter',
          url: 'https://twitter.com/WordPress',
        },
      },
    ],
  },
  icon: 'admin-customizer',
  edit,
  save,
  deprecated,
};

export const init = () => initBlock({ name, metadata, settings });
