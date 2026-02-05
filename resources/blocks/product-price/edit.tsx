/**
 * External dependencies
 */
import { clsx } from 'clsx';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { useEffect, useCallback, Platform } from '@wordpress/element';
import { useDispatch, useSelect, select } from '@wordpress/data';

import {
	AlignmentControl,
	BlockControls,
	RichText,
	useBlockProps,
	store as blockEditorStore,
	useBlockEditingMode,
	InspectorControls
} from '@wordpress/block-editor';
import type { BlockEditProps } from '@wordpress/blocks';
import {
	PanelBody,
	SelectControl,
  __experimentalText as Text,
  ToggleControl,
} from '@wordpress/components';

import apiFetch from '@wordpress/api-fetch';

/**
 * Internal dependencies
 */
import { generateAnchor, setAnchor } from './autogenerate-anchors';
import ProductSelector from '../../components/product-selector';

/**
 * Types
 */
type TextAlign = 'left' | 'center' | 'right' | 'justify' | undefined;

type TagName = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'div' | 'span';

interface Attributes {
	textAlign?: TextAlign;
	content?: string;
	level: number;
	placeholder?: string;
	anchor?: string;
	tagName?: string; // allow custom tags / legacy values
	helpText?: string;
  productId?: string;
  showBillingCycle?: boolean;
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
	clientId,
}: Props) {
	const {
		textAlign,
		content = '',
		level,
		placeholder,
		anchor,
		tagName,
		helpText,
    productId,
    showBillingCycle,
	} = attributes;

	const effectiveTag: TagName = (tagName && tagName.length ? tagName : `h${level}`) as TagName;

	const blockProps = useBlockProps({
		className: clsx({
			[`has-text-align-${textAlign}`]: !!textAlign,
		}),
		style,
	});

	const blockEditingMode = useBlockEditingMode();

	const { canGenerateAnchors } = useSelect((wpSelect) => {
		const { getGlobalBlockCount, getSettings } = wpSelect(blockEditorStore) as any;
		const settings = getSettings?.() ?? {};

		return {
			canGenerateAnchors:
				!!settings.generateAnchors || (getGlobalBlockCount?.('core/table-of-contents') ?? 0) > 0,
		};
	}, []);

	const { __unstableMarkNextChangeAsNotPersistent } = useDispatch(blockEditorStore) as any;

	useEffect(() => {
		if (!canGenerateAnchors) return;

		if (!anchor && content) {
			__unstableMarkNextChangeAsNotPersistent?.();
			setAttributes({
				anchor: generateAnchor(clientId, content),
			});
		}

		setAnchor(clientId, anchor);

		return () => setAnchor(clientId, null);
	}, [anchor, content, clientId, canGenerateAnchors, setAttributes, __unstableMarkNextChangeAsNotPersistent]);

	const onContentChange = (value: string) => {
		const newAttrs: Partial<Attributes> = { content: value };

		if (
			canGenerateAnchors &&
			(!anchor || !value || generateAnchor(clientId, content) === anchor)
		) {
			newAttrs.anchor = generateAnchor(clientId, value);
		}

		setAttributes(newAttrs);
	};

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
          <ToggleControl
            label="Show Billing Cycle"
            checked={!!showBillingCycle}
            onChange={(next: boolean) => {
              setAttributes({
                showBillingCycle: !!next
              });
            }}
          />
					<SelectControl
						label={__('HTML tag')}
						value={effectiveTag}
						options={[
							{ label: 'H1', value: 'h1' },
							{ label: 'H2', value: 'h2' },
							{ label: 'H3', value: 'h3' },
							{ label: 'H4', value: 'h4' },
							{ label: 'H5', value: 'h5' },
							{ label: 'H6', value: 'h6' },
							{ label: 'Paragraph', value: 'p' },
							{ label: 'Div', value: 'div' },
							{ label: 'Span', value: 'span' },
						]}
						onChange={(selected?: string) => {
							// If user picked an hN, sync level and set tagName.
							if (selected && selected.startsWith('h')) {
								const parsed = parseInt(selected.slice(1), 10);
								const currentLevel = Number.isNaN(parsed) ? level : parsed;

								setAttributes({
									level: currentLevel,
									tagName: `h${currentLevel}`,
								});
							} else {
								setAttributes({ tagName: selected });
							}
						}}
					/>
				</PanelBody>
			</InspectorControls>

			<RichText
				identifier="content"
				tagName={effectiveTag}
				value={content}
				onChange={onContentChange}
				onMerge={mergeBlocks}
				onReplace={onReplace}
				onRemove={() => onReplace([])}
				placeholder={placeholder || __('Product Price')}
				textAlign={textAlign}
				{...(Platform.isNative && { deleteEnter: true })}
				{...blockProps}
			/>
		</>
	);
}

export default Edit;
