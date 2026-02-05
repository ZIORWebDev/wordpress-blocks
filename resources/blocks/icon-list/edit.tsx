import type { ReactElement } from 'react';
import { __ } from '@wordpress/i18n';
import {
	InspectorControls,
	useBlockProps,
	useInnerBlocksProps,
} from '@wordpress/block-editor';
import { createBlock } from '@wordpress/blocks';
import { dispatch } from '@wordpress/data';
import { PanelBody, SelectControl, Button } from '@wordpress/components';
import type { BlockEditProps, BlockInstance } from '@wordpress/blocks';

import type { Attributes } from './index';
type ListType = NonNullable<Attributes['listType']>;

const TEMPLATE = [
	[
		'zior/icon-list-item',
		{},
		[
			[ 'zior/icon-picker', {} ],
			[ 'core/paragraph', {} ],
		],
	],
] as const;

const LIST_TAGS: Record<ListType, 'ul' | 'ol'> = {
	ul: 'ul',
	ol: 'ol',
};

const LIST_TYPE_OPTIONS: Array<{ label: string; value: ListType }> = [
	{ label: __( 'Unordered', 'wordpress-blocks' ), value: 'ul' },
	{ label: __( 'Ordered', 'wordpress-blocks' ), value: 'ol' },
];

export default function IconListEdit( {
	attributes,
	setAttributes,
	clientId,
}: BlockEditProps<Attributes> ): ReactElement {
	const listType: ListType = attributes.listType ?? 'ul';
	const ListTag = LIST_TAGS[ listType ];

	const onChangeListType = ( value: string ) => {
		if ( value === 'ul' || value === 'ol' ) {
			setAttributes( { listType: value } );
		}
	};

	const handleAddItem = () => {
		const iconPicker = createBlock( 'zior/icon-picker' ) as BlockInstance;
		const paragraph = createBlock( 'core/paragraph' ) as BlockInstance;

		const listItem = createBlock(
			'zior/icon-list-item',
			{},
			[ iconPicker, paragraph ]
		) as BlockInstance;

		// insertBlocks expects an array
		dispatch( 'core/block-editor' ).insertBlocks( [ listItem ], undefined, clientId );
	};

	const blockProps = useBlockProps( { className: 'ziorweb-icon-list' } );

	const innerBlocksProps = useInnerBlocksProps( blockProps, {
		// WP typings differ by version; template typing is inconsistent across packages.
		template: TEMPLATE as unknown as any,
		templateLock: false,

		// No __experimentalAppenderTagName (not in your types)
		// Wrap the appender in <li> yourself to preserve list semantics.
		renderAppender: () => (
			<li className="ziorweb-icon-list__appender">
				<Button
					variant="secondary"
					onClick={ handleAddItem }
					className="ziorweb-icon-list__add-item"
				>
					{ __( 'Add Item', 'wordpress-blocks' ) }
				</Button>
			</li>
		),
	} );

	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'List Settings', 'wordpress-blocks' ) } initialOpen={ true }>
					<SelectControl
						label={ __( 'List Type', 'wordpress-blocks' ) }
						value={ listType }
						options={ LIST_TYPE_OPTIONS }
						onChange={ onChangeListType }
					/>
				</PanelBody>
			</InspectorControls>

			<ListTag { ...innerBlocksProps } />
		</>
	);
}
