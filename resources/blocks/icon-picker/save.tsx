import { clsx } from 'clsx';
import { useBlockProps, useInnerBlocksProps } from '@wordpress/block-editor';
import type { BlockSaveProps } from '@wordpress/blocks';

type Attributes = {
	iconBackgroundColorValue?: string;
	iconColorValue?: string;
	showLabels?: boolean;
	size?: string;
};

export default function save(props: BlockSaveProps<Attributes>) {
	const {
		attributes: {
			iconBackgroundColorValue,
			iconColorValue,
			showLabels = false,
			size,
		},
	} = props;

	const className = clsx(size, {
		'has-visible-labels': !!showLabels,
		'has-icon-color': !!iconColorValue,
		'has-icon-background-color': !!iconBackgroundColorValue,
	});

	const blockProps = useBlockProps.save({ className });
	const innerBlocksProps = useInnerBlocksProps.save(blockProps);

	return <span {...innerBlocksProps} />;
}
