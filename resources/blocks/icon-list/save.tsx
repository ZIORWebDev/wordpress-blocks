import { useBlockProps, InnerBlocks } from '@wordpress/block-editor';
import type { BlockSaveProps } from '@wordpress/blocks';

import type { Attributes } from './index';

export default function IconListSave(
	props: BlockSaveProps<Attributes>
) {
	const { listType = 'ul' } = props.attributes;

	const blockProps = useBlockProps.save( {
		className: 'ziorweb-icon-list',
	} );

	const ListTag = listType;

	return (
		<ListTag { ...blockProps }>
			<InnerBlocks.Content />
		</ListTag>
	);
}
