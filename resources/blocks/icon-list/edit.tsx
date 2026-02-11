import { __ } from '@wordpress/i18n';
import {
	useBlockProps,
	useInnerBlocksProps,
	InspectorControls,
} from '@wordpress/block-editor';
import { createBlock } from '@wordpress/blocks';
import { dispatch } from '@wordpress/data';
import { PanelBody, SelectControl } from '@wordpress/components';
import type { BlockEditProps, BlockInstance } from '@wordpress/blocks';
import type { ComponentType } from 'react';

type ListType = 'ul' | 'ol';

type Attributes = {
	listType?: ListType;
};

type IconListItemAppenderProps = {
	rootClientId: string;
};

const TEMPLATE = [
	[
		'zior/icon-list-item',
		{},
		[
			['zior/icon-picker', {}],
			['core/paragraph', {}],
		],
	],
] as const;

export default function Edit({
	attributes,
	setAttributes,
	clientId,
}: BlockEditProps<Attributes>) {
	const { listType = 'ul' } = attributes;

	const IconListItemAppender: ComponentType = (() => {
		const Appender = ({ rootClientId }: IconListItemAppenderProps) => {
			const handleAddItem = () => {
				const iconPicker: BlockInstance = createBlock('zior/icon-picker');
				const paragraph: BlockInstance = createBlock('core/paragraph');

				const listItem: BlockInstance = createBlock('zior/icon-list-item', {}, [
					iconPicker,
					paragraph,
				]);

				// insertBlocks expects an array in the typings
				dispatch('core/block-editor').insertBlocks([listItem], undefined, rootClientId);
			};

			return (
				<button
					type="button"
					className="components-button components-icon-button"
					onClick={handleAddItem}
				>
					{__('Add Item', 'wordpress-blocks')}
				</button>
			);
		};

		return () => <Appender rootClientId={clientId} />;
	})();

	const blockProps = useBlockProps({ className: 'ziorweb-icon-list' });
  const innerBlocksOptions = {
    template: TEMPLATE,
    renderAppender: IconListItemAppender,
    __experimentalAppenderTagName: 'li',
  } as unknown as Parameters<typeof useInnerBlocksProps>[1];
  const innerBlocksProps = useInnerBlocksProps(blockProps, innerBlocksOptions);

	const ListTag: ListType = listType;

	return (
		<>
			<InspectorControls>
				<PanelBody title={__('List Settings', 'wordpress-blocks')} initialOpen>
					<SelectControl
						label={__('List Type', 'wordpress-blocks')}
						value={listType}
						options={[
							{ label: __('Unordered', 'wordpress-blocks'), value: 'ul' },
							{ label: __('Ordered', 'wordpress-blocks'), value: 'ol' },
						]}
						onChange={(value) =>
							setAttributes({ listType: (value as ListType) || 'ul' })
						}
					/>
				</PanelBody>
			</InspectorControls>

			<ListTag {...innerBlocksProps} />
		</>
	);
}
