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
// import save from './save';
import metadata from '../../../php/blocks/Icon/block.json';
import variations from './variations';

const { name } = metadata;

export { metadata, name };

export const settings = {
  icon: 'color-picker',
  edit,
  // save,
  variations,
};

if (window.__experimentalContentOnlyPatternInsertion) {
  settings.fields = [
    {
      label: __('Link'),
      type: 'Link',
      shownByDefault: true,
      mapping: {
        href: 'url',
        rel: 'rel',
      },
    },
    {
      label: __('Label'),
      type: 'RichText',
      shownByDefault: false,
      mapping: {
        value: 'label',
      },
    },
  ];
}

wp.hooks.addFilter(
  'blocks.registerBlockType',
  'ziorwebdev/remove-align-toolbar',
  (settings, name) => {
    if (name === 'ziorwebdev/icon') {
      // remove align support
      settings.supports = {
        ...settings.supports,
        align: false,
      };
    }
    return settings;
  },
);

export const init = () => initBlock({ name, metadata, settings });
