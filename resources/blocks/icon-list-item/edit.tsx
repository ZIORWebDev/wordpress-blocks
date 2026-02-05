import { useBlockProps, useInnerBlocksProps } from '@wordpress/block-editor';
import type { BlockEditProps, InnerBlockTemplate } from '@wordpress/blocks';

const TEMPLATE: InnerBlockTemplate[] = [
	[ 'zior/icon-picker', {} ],
	[ 'core/paragraph', {} ],
];

export default function IconListItemEdit(
	_props: BlockEditProps<Record<string, never>>
) {
	const blockProps = useBlockProps({ className: 'zior-icon-list-item' });

	const innerBlocksProps = useInnerBlocksProps(blockProps, {
		template: TEMPLATE,
		renderAppender: undefined,
	});

	return <li {...innerBlocksProps} />;
}
