const { useBlockProps, useInnerBlocksProps } = wp.blockEditor;

export default function IconListItemEdit() {
  const blockProps = useBlockProps({ className: 'zior-icon-list-item' });
  const innerBlocksProps = useInnerBlocksProps(blockProps, {
    template: [
      ['zior/icon-picker', {}],
      ['core/paragraph', {}],
    ],
    renderAppender: false,
  });

  return <li {...innerBlocksProps} />;
}
