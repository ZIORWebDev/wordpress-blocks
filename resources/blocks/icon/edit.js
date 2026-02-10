import clsx from 'clsx';

const { useBlockProps, InspectorControls } = wp.blockEditor;
const {
  TextControl,
  ExternalLink,
  __experimentalToolsPanel: ToolsPanel,
  __experimentalToolsPanelItem: ToolsPanelItem,
  Icon,
} = wp.components;
const { __ } = wp.i18n;
const { useSelect, useDispatch } = wp.data;

import { getIconService } from './icon-list';
import { useToolsPanelDropdownMenuProps } from '../../utils/hooks';

const IconEdit = ({ attributes, context, setAttributes, name, clientId }) => {
  const { url, service, label = '', rel } = attributes;
  const dropdownMenuProps = useToolsPanelDropdownMenuProps();
  const {
    showLabels,
    iconColor,
    iconColorValue,
    iconBackgroundColor,
    iconBackgroundColorValue,
  } = context;

  const { activeVariation } = useSelect(
    (select) => {
      const { getActiveBlockVariation } = select(wp.blocks.store);
      return { activeVariation: getActiveBlockVariation(name, attributes) };
    },
    [name, attributes],
  );

  const { icon, label: iconLinkName } = getIconService(activeVariation);
  const iconLinkText = label.trim() === '' ? iconLinkName : label;

  const parentClientId = useSelect(
    (select) => select('core/block-editor').getBlockRootClientId(clientId),
    [clientId],
  );
  const { selectBlock } = useDispatch('core/block-editor');

  const wrapperClasses = clsx(
    'wp-ziorwebdev-icon',
    'wp-block-ziorwebdev-icon',
    'wp-ziorwebdev-icon-' + service,
    {
      'wp-ziorwebdev-icon__is-incomplete': !url,
      [`has-${iconColor}-color`]: iconColor,
      [`has-${iconBackgroundColor}-background-color`]: iconBackgroundColor,
    },
  );

  const blockProps = useBlockProps({
    className: 'wp-block-ziorwebdev-icon-anchor',
    onClick: (e) => {
      e.stopPropagation(); // Prevent selecting the child
      if (parentClientId) {
        selectBlock(parentClientId); // Select parent block
      }
    },
  });

  return (
    <>
      {/* Inspector controls */}
      <InspectorControls>
        <ToolsPanel
          label={__('Settings')}
          resetAll={() => setAttributes({ label: undefined })}
          dropdownMenuProps={dropdownMenuProps}
        >
          <ToolsPanelItem
            isShownByDefault
            label={__('Text')}
            hasValue={() => !!label}
            onDeselect={() => setAttributes({ label: undefined })}
          >
            <TextControl
              __next40pxDefaultSize
              __nextHasNoMarginBottom
              label={__('Text')}
              help={__(
                'The text is visible when enabled from the parent Icon Picker block.',
              )}
              value={label}
              onChange={(value) => setAttributes({ label: value })}
              placeholder={iconLinkName}
            />
          </ToolsPanelItem>
        </ToolsPanel>
        <InspectorControls group="advanced">
          <TextControl
            __next40pxDefaultSize
            __nextHasNoMarginBottom
            label={__('Link relation')}
            help={
              <ExternalLink href="https://developer.mozilla.org/docs/Web/HTML/Attributes/rel">
                {__(
                  'The <a>Link Relation</a> attribute defines the relationship between a linked resource and the current document.',
                )}
              </ExternalLink>
            }
            value={rel || ''}
            onChange={(value) => setAttributes({ rel: value })}
          />
        </InspectorControls>
      </InspectorControls>

      {/* Icon block */}
      <span
        role="presentation"
        className={wrapperClasses}
        style={{
          color: iconColorValue,
          backgroundColor: iconBackgroundColorValue,
        }}
      >
        <button {...blockProps} role="button">
          <Icon icon={icon} />
          <span
            className={clsx('wp-block-ziorwebdev-icon-label', {
              'screen-reader-text': !showLabels,
            })}
          >
            {iconLinkText}
          </span>
        </button>
      </span>
    </>
  );
};

export default IconEdit;
