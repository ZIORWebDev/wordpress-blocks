const { createBlock } = wp.blocks;
const { Button } = wp.components;
const { useDispatch } = wp.data;

const IconListItemInserter = ({ rootClientId }) => {
  const { insertBlocks } = useDispatch('core/block-editor');

  const handleInsert = () => {
    const iconPicker = createBlock('ziorwebdev/icon-picker', {});
    const paragraph = createBlock('core/paragraph', {});

    // Wrap into a single list-item block
    const listItem = createBlock('ziorwebdev/icon-list-item', {}, [
      iconPicker,
      paragraph,
    ]);

    // Insert as one atomic unit
    insertBlocks(listItem, undefined, rootClientId);
  };

  return (
    <Button isPrimary onClick={handleInsert}>
      Add Item
    </Button>
  );
};

export default IconListItemInserter;
