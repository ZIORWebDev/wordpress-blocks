import { InnerBlocks, InspectorControls, useBlockProps } from '@wordpress/block-editor';
import { PanelBody, ToggleControl, TextControl } from '@wordpress/components';
import { useEffect, useMemo, useCallback } from '@wordpress/element';
import { useSelect, useDispatch } from '@wordpress/data';

import ProductSelector from '../../components/product-selector';

type Attributes = {
  productId?: string | number;
  showQuantity?: boolean;
  quantity?: number | string;
};

type EditProps = {
  attributes: Attributes;
  setAttributes: (next: Partial<Attributes>) => void;
  clientId: string;
};

function mergeClasses(existing = '', add = ''): string {
  const classes = new Set(`${existing} ${add}`.trim().split(/\s+/).filter(Boolean));
  return Array.from(classes).join(' ');
}

export default function Edit({ attributes, setAttributes, clientId }: EditProps) {
  const { productId, showQuantity = false, quantity = 1 } = attributes;

  const blockProps = useBlockProps({
    className: 'zior-add-to-cart add_to_cart_button ajax_add_to_cart',
  });

  const normalizedQty = useMemo(() => {
    const n = typeof quantity === 'string' ? parseInt(quantity, 10) : Number(quantity);
    return Number.isFinite(n) && n > 0 ? n : 1;
  }, [quantity]);

  const addToCartUrl = useMemo(() => {
    if (!productId) return '';
    const qty = showQuantity ? normalizedQty : 1;
    return `/?add-to-cart=${encodeURIComponent(String(productId))}&quantity=${encodeURIComponent(
      String(qty),
    )}`;
  }, [productId, showQuantity, normalizedQty]);

  // Read the first inner block (expected: core/button)
  const coreButton = useSelect(
    (select) => {
      const parent = select('core/block-editor').getBlock(clientId) as
        | { innerBlocks?: Array<{ name: string; clientId: string; attributes?: Record<string, any> }> }
        | undefined;

      const first = parent?.innerBlocks?.[0];
      if (!first || first.name !== 'core/button') return null;
      return first;
    },
    [clientId],
  );

  const { updateBlockAttributes } = useDispatch('core/block-editor') as {
    updateBlockAttributes: (blockClientId: string, attrs: Record<string, any>) => void;
  };

  const syncInnerButton = useCallback(() => {
    if (!coreButton?.clientId) return;

    const buttonClass = coreButton.attributes?.className ?? '';
    const newClasses = mergeClasses(buttonClass, 'add_to_cart_button ajax_add_to_cart');

    updateBlockAttributes(coreButton.clientId, {
      className: newClasses,
      // set when selected; clear when not selected
      url: addToCartUrl || undefined,
    });
  }, [coreButton?.clientId, coreButton?.attributes, addToCartUrl, updateBlockAttributes]);

  useEffect(() => {
    syncInnerButton();
  }, [syncInnerButton]);

  return (
    <>
      <InspectorControls>
        <PanelBody title="Product" initialOpen>
          <ProductSelector
            value={productId ?? ''}
            onChange={(nextProductId: string | number) => setAttributes({ productId: nextProductId })}
          />

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
