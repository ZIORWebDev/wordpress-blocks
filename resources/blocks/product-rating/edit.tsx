// blocks/ProductRating/edit.tsx (your uploaded edit.tsx)
import { clsx } from 'clsx';
import { __ } from '@wordpress/i18n';
import { useEffect, useRef, Platform } from '@wordpress/element';

import {
	AlignmentControl,
	BlockControls,
	RichText,
	useBlockProps,
	store as blockEditorStore,
	useBlockEditingMode,
	InspectorControls,
} from '@wordpress/block-editor';
import type { BlockEditProps } from '@wordpress/blocks';
import { PanelBody, SelectControl, __experimentalText as Text } from '@wordpress/components';

// ✅ updated import
import ProductSelector, { fetchProductInfo } from '../../components/product-selector';

type TextAlign = 'left' | 'center' | 'right' | 'justify' | undefined;

interface Attributes {
	textAlign?: TextAlign;
	content?: string;
	level: number;
	placeholder?: string;
	anchor?: string;
	tagName?: string;
	helpText?: string;
	productId?: string;
}

type Props = BlockEditProps<Attributes>;

export function Edit({ attributes, setAttributes, mergeBlocks, onReplace }: Props) {
	const { textAlign, content = '', placeholder, helpText, productId } = attributes;

	const blockProps = useBlockProps({
		className: clsx({
			[`has-text-align-${textAlign}`]: !!textAlign,
		}),
	});

	const blockEditingMode = useBlockEditingMode();

	const onContentChange = (value: string) => {
		setAttributes({ content: value });
	};

	// ✅ shared fetch, stale-response safe
	const reqSeqRef = useRef(0);

	useEffect(() => {
		if (!productId) return;

		const seq = ++reqSeqRef.current;

		fetchProductInfo(productId)
			.then((response) => {
				if (seq !== reqSeqRef.current) return;

				const product = response?.product as { rating_html?: string } | undefined;
				setAttributes({ content: product?.rating_html ?? '' });
			})
			.catch(() => {
				if (seq !== reqSeqRef.current) return;
				setAttributes({ content: '' });
			});
	}, [productId, setAttributes]);

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

			<div className="woocommerce">
				<RichText
					identifier="content"
					tagName="div"
					value={content}
					onChange={onContentChange}
					onMerge={mergeBlocks}
					onReplace={onReplace}
					onRemove={() => onReplace([])}
					placeholder={placeholder || __('Product Rating')}
					textAlign={textAlign}
					allowedFormats={[]}
					{...(Platform.isNative && { deleteEnter: true })}
					{...blockProps}
				/>
			</div>
		</>
	);
}

export default Edit;
