const { useBlockProps, useInnerBlocksProps } = wp.blockEditor;

export default function IconListItemSave() {
  const blockProps = useBlockProps.save({
    className: 'ziorwebdev-icon-list-item',
  });
  const innerBlocksProps = useInnerBlocksProps.save(blockProps);

  return <li {...innerBlocksProps} />;
}
