const { useBlockProps, InnerBlocks } = wp.blockEditor;

export default function IconListSave({ attributes }) {
  const { listType = 'ul' } = attributes;

  const blockProps = useBlockProps.save({ className: 'ziorweb-icon-list' });

  // Render <ul> or <ol> depending on listType
  const ListTag = listType;

  return (
    <ListTag {...blockProps}>
      <InnerBlocks.Content />
    </ListTag>
  );
}
