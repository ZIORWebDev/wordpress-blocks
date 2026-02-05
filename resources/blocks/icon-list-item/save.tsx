import { InnerBlocks, useBlockProps } from '@wordpress/block-editor';

type Attributes = {
	// add attributes later if needed
};

type SaveProps = {
	attributes: Attributes;
};

export default function IconListItemSave( { attributes }: SaveProps ) {
	const blockProps = useBlockProps.save( {
		className: 'zior-icon-list-item',
	} );

	return (
		<li { ...blockProps }>
			<InnerBlocks.Content />
		</li>
	);
}
