import { useBlockProps, useInnerBlocksProps } from '@wordpress/block-editor';

export default function Save() {
	const blockProps = useBlockProps.save({
		className: 'zior-icon-list-item',
	});

	const innerBlocksProps = useInnerBlocksProps.save(blockProps);

	return <li {...innerBlocksProps} />;
}
