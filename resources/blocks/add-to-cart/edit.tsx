import { InnerBlocks, InspectorControls, useBlockProps } from '@wordpress/block-editor';
import { PanelBody, ToggleControl, TextControl } from '@wordpress/components';
import { useEffect, useMemo, useCallback, useRef } from '@wordpress/element';
import { useSelect, useDispatch } from '@wordpress/data';
import type { BlockInstance, BlockEditProps } from '@wordpress/blocks';
import { ProductSelector } from '@ziorweb-dev/product-selector';
import type { Attributes } from './index';

function mergeClasses(existing = '', add = ''): string {
	const classes = new Set(`${existing} ${add}`.trim().split(/\s+/).filter(Boolean));
	return Array.from(classes).join(' ');
}

type BlockEditorSelectors = {
	getBlock: (clientId: string) => (BlockInstance & { innerBlocks?: BlockInstance[] }) | null;
};

type ProductValue = { id?: string; label?: string };

export default function Edit({ attributes, setAttributes, clientId }: BlockEditProps<Attributes>) {
	const { product, showQuantity = false, quantity = 1 } = attributes;

	// 🔹 Refs
	const lastFetchedIdRef = useRef<string>('');
	const reqSeqRef = useRef<number>(0);

	const selectedProduct: ProductValue = useMemo(() => {
		const p = (product ?? {}) as ProductValue;
		return {
			id: typeof p.id === 'string' ? p.id : '',
			label: typeof p.label === 'string' ? p.label : '',
		};
	}, [product]);

	const blockProps = useBlockProps({
		className: 'zior-add-to-cart add_to_cart_button ajax_add_to_cart',
	});

	const normalizedQty = useMemo(() => {
		const n = typeof quantity === 'string' ? parseInt(quantity, 10) : Number(quantity);
		return Number.isFinite(n) && n > 0 ? n : 1;
	}, [quantity]);

	// 🔹 Inner button sync
	const coreButton = useSelect((select) => {
		const editor = select('core/block-editor') as unknown as BlockEditorSelectors;

		const parent = editor.getBlock(clientId);
		const first = parent?.innerBlocks?.[0];
		return first?.name === 'core/button' ? first : null;
	}, [clientId]);

	const { updateBlockAttributes } = useDispatch('core/block-editor') as {
		updateBlockAttributes: (blockClientId: string, attrs: Record<string, any>) => void;
	};

	const syncInnerButton = useCallback(() => {
		if (!coreButton?.clientId) return;

		const buttonClass = coreButton.attributes?.className ?? '';
		const newClasses = mergeClasses(buttonClass, 'add_to_cart_button ajax_add_to_cart');

		updateBlockAttributes(coreButton.clientId, {
			className: newClasses,
		});
	}, [coreButton?.clientId, coreButton?.attributes, updateBlockAttributes]);

	useEffect(() => {
		syncInnerButton();
	}, [syncInnerButton]);

	return (
		<>
			<InspectorControls>
				<PanelBody title="Product" initialOpen>
					{ attributes.showProductSelector && (
					<ProductSelector
						value={selectedProduct.id ?? ''}
						onChange={(nextProduct: { id: string; label: string }) => {
							setAttributes({
								product: {
									id: nextProduct?.id ?? '',
									label: nextProduct?.label ?? '',
								},
							});
						}}
					/>
					) }
					<ToggleControl
						label="Show quantity"
						checked={!!showQuantity}
						onChange={(next: boolean) => {
							setAttributes({
								showQuantity: !!next,
								...(next ? { quantity: normalizedQty } : {}),
							});
						}}
					/>
				</PanelBody>
			</InspectorControls>

			<div {...blockProps}>
				{showQuantity && (
					<TextControl
						type="number"
						label="Quantity"
						hideLabelFromVision
						value={normalizedQty}
						min={1}
						step={1}
						onChange={(val: string) => {
							const n = parseInt(val, 10);
							setAttributes({ quantity: Number.isFinite(n) && n > 0 ? n : 1 });
						}}
					/>
				)}

				<InnerBlocks
					allowedBlocks={['core/button']}
					template={[['core/button', { text: 'Get Product' }]]}
				/>
			</div>
		</>
	);
}