import { InnerBlocks, useBlockProps } from '@wordpress/block-editor';

type ListType = 'ul' | 'ol';

type Attributes = {
	listType?: ListType;
};

type SaveProps = {
	attributes: Attributes;
};

export default function Save({ attributes }: SaveProps) {
	const { listType = 'ul' } = attributes;

	const blockProps = useBlockProps.save({
		className: 'ziorweb-icon-list',
	});

	// Ensure only valid tags are used (keeps runtime safe even if bad data slips in)
	const ListTag: ListType = listType === 'ol' ? 'ol' : 'ul';

	return (
		<ListTag {...blockProps}>
			<InnerBlocks.Content />
		</ListTag>
	);
}
