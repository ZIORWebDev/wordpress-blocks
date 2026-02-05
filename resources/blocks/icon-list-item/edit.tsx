import { useBlockProps, useInnerBlocksProps } from '@wordpress/block-editor';
import type { BlockEditProps, InnerBlockTemplate } from '@wordpress/blocks';
import type { ComponentType } from '@wordpress/element';

import type { Attributes } from './index';

// `InnerBlockTemplate` is the *item* type, so the full template is `InnerBlockTemplate[]`
const TEMPLATE: InnerBlockTemplate[] = [
	[ 'zior/icon-picker', {} ],
	[ 'core/paragraph', {} ],
];

const NoAppender: ComponentType = () => null;

export default function IconListItemEdit( {
	attributes,
	setAttributes,
	clientId,
}: BlockEditProps< Attributes > ) {
	void attributes;
	void setAttributes;
	void clientId;

	const blockProps = useBlockProps( { className: 'zior-icon-list-item' } );

	const innerBlocksProps = useInnerBlocksProps( blockProps, {
		template: TEMPLATE,
		renderAppender: NoAppender, // runtime allows false, typings often don’t
	} );

	return <li { ...innerBlocksProps } />;
}
