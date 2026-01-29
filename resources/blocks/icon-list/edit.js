const { __ } = wp.i18n;
const { useBlockProps, useInnerBlocksProps, InspectorControls } =
  wp.blockEditor;
const { createBlock } = wp.blocks;
const { PanelBody, SelectControl } = wp.components;

export default function IconListEdit({ attributes, setAttributes, clientId }) {
  const { listType = 'ul' } = attributes;

  // Custom appender for the InnerBlocks
  const IconListItemAppender = () => {
    const handleAddItem = () => {
      const iconPicker = createBlock('zior/icon-picker');
      const paragraph = createBlock('core/paragraph');

      const listItem = createBlock('zior/icon-list-item', {}, [
        iconPicker,
        paragraph,
      ]);

      wp.data
        .dispatch('core/block-editor')
        .insertBlocks(listItem, undefined, clientId);
    };

    return (
      <button
        type="button"
        className="components-button components-icon-button"
        onClick={handleAddItem}
      >
        {__('Add Item', 'wordpress-blocks')}
      </button>
    );
  };

  // Inspector Controls for list type
  const inspectorControls = (
    <InspectorControls>
      <PanelBody
        title={__('List Settings', 'wordpress-blocks')}
        initialOpen={true}
      >
        <SelectControl
          label={__('List Type', 'wordpress-blocks')}
          value={listType}
          options={[
            { label: __('Unordered', 'wordpress-blocks'), value: 'ul' },
            { label: __('Ordered', 'wordpress-blocks'), value: 'ol' },
          ]}
          onChange={(value) => setAttributes({ listType: value })}
        />
      </PanelBody>
    </InspectorControls>
  );

  const blockProps = useBlockProps({ className: 'ziorweb-icon-list' });
  const innerBlocksProps = useInnerBlocksProps(blockProps, {
    template: [
      [
        'zior/icon-list-item',
        {},
        [
          ['zior/icon-picker', {}],
          ['core/paragraph', {}],
        ],
      ],
    ],
    templateLock: false,
    __experimentalAppenderTagName: 'li',
    renderAppender: IconListItemAppender,
  });

  // Render <ul> or <ol> based on listType
  const ListTag = listType;

  return (
    <>
      {inspectorControls}
      <ListTag {...innerBlocksProps} />
    </>
  );
}
