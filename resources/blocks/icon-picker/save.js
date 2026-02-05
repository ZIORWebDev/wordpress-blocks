import clsx from 'clsx';
const { useInnerBlocksProps, useBlockProps } = wp.blockEditor;

export default function save(props) {
  const {
    attributes: { iconBackgroundColorValue, iconColorValue, showLabels, size },
    clientId,
  } = props;

  const className = clsx(size, {
    'has-visible-labels': showLabels,
    'has-icon-color': iconColorValue,
    'has-icon-background-color': iconBackgroundColorValue,
  });

  const blockProps = useBlockProps.save({ className });
  const innerBlocksProps = useInnerBlocksProps.save(blockProps);

  return <span {...innerBlocksProps} />;
}