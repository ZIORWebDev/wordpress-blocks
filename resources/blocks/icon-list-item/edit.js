const { useBlockProps, useInnerBlocksProps } = wp.blockEditor;

export default function IconListItemEdit() {
  const blockProps = useBlockProps({ className: 'ziorwebdev-icon-list-item' });
  const innerBlocksProps = useInnerBlocksProps(blockProps, {
    template: [
      ['ziorwebdev/icon-picker', {}],
      ['core/paragraph', {}],
    ],
    renderAppender: false,
  });

  return <li {...innerBlocksProps} />;
}
