/**
 * External dependencies
 */
import { clsx } from 'clsx';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { useEffect, useCallback, Platform } from '@wordpress/element';

import {
	AlignmentControl,
	BlockControls,
	RichText,
	useBlockProps,
	useBlockEditingMode,
	InspectorControls
} from '@wordpress/block-editor';
import type { BlockEditProps } from '@wordpress/blocks';
import {
	PanelBody,
  __experimentalText as Text,
} from '@wordpress/components';

import apiFetch from '@wordpress/api-fetch';

/**
 * Internal dependencies
 */
import ProductSelector from '../../components/product-selector';

/**
 * Types
 */
type TextAlign = 'left' | 'center' | 'right' | 'justify' | undefined;

interface Attributes {
	textAlign?: TextAlign;
	content?: string;
	helpText?: string;
  productId?: string;
}

type Props = BlockEditProps<Attributes>;

/**
 * Note: ZIORWPBlocks + wpApiSettings are globals provided by WP.
 */
declare const ZIORWPBlocks: { restUrl: string };
declare const wpApiSettings: { nonce: string };

function Edit({
	attributes,
	setAttributes,
	mergeBlocks,
	onReplace,
	style,
}: Props) {
	const {
		textAlign,
		content = '',
		placeholder,
		helpText,
    	productId,
	} = attributes;

	const blockProps = useBlockProps({
		className: clsx({
			[`has-text-align-${textAlign}`]: !!textAlign,
		}),
		style,
	});

	const blockEditingMode = useBlockEditingMode();

	function getParameters(attrs: Attributes) {
		const params = new URLSearchParams({
			productId: attrs.productId ?? '',
		});

		return params;
	}

	const fetchProduct = useCallback(
		async (attrs: Attributes) => {
			const { productId: pid } = attrs;
			if (!pid) return;

			try {
				const path = `/${ZIORWPBlocks.restUrl}/products/information?${getParameters(
					attrs).toString()}`;

				const response = (await apiFetch({
					path,
					headers: { 'X-WP-Nonce': wpApiSettings.nonce },
				})) as { product?: { price_html?: string } };

				setAttributes({ content: response?.product?.price_html ?? '' });
			} catch {
				setAttributes({ content: '' });
			}
		},
		[setAttributes]
	);

	useEffect(() => {
		if (!productId) return;
		fetchProduct(attributes);
	}, [productId, fetchProduct, attributes]);

	return (
		<>
			{blockEditingMode === 'default' && (
				<BlockControls group="block">
					<AlignmentControl
						value={textAlign}
						onChange={(nextAlign?: TextAlign) => setAttributes({ textAlign: nextAlign })}
					/>
				</BlockControls>
			)}

			<InspectorControls>
				<PanelBody title={__('Settings')} initialOpen={true}>
					{helpText && (
						<Text variant="small" style={{ marginBottom: '12px', display: 'block' }}>
							{helpText}
						</Text>
          )}

					<ProductSelector
						value={productId ?? ''}
						onChange={(nextProductId: string) => setAttributes({ productId: nextProductId })}
					/>
				</PanelBody>
			</InspectorControls>

			<RichText
				identifier="content"
				tagName={''}
				value={content}
				onMerge={mergeBlocks}
				onReplace={onReplace}
				onRemove={() => onReplace([])}
				placeholder={placeholder || __('Product Rating')}
				textAlign={textAlign}
				{...(Platform.isNative && { deleteEnter: true })}
				{...blockProps}
			/>
		</>
	);
}

export default Edit;
