import { InnerBlocks, InspectorControls, useBlockProps } from '@wordpress/block-editor';
import { PanelBody, ToggleControl, TextControl } from '@wordpress/components';
import { useEffect, useMemo, useCallback } from '@wordpress/element';
import { useSelect, useDispatch } from '@wordpress/data';
import type { BlockInstance, BlockEditProps } from '@wordpress/blocks';

import ProductSelector from '../../components/product-selector';
import type { Attributes } from './index';

function mergeClasses(existing = '', add = ''): string {
  const classes = new Set(`${existing} ${add}`.trim().split(/\s+/).filter(Boolean));
  return Array.from(classes).join(' ');
}

export default function Edit({ attributes, setAttributes, clientId }:  BlockEditProps<Attributes>) {
  const { productId, showQuantity = false, quantity = 1 } = attributes;

  const blockProps = useBlockProps({
    className: 'zior-add-to-cart add_to_cart_button ajax_add_to_cart',
  });

  const normalizedQty = useMemo(() => {
    const n = typeof quantity === 'string' ? parseInt(quantity, 10) : Number(quantity);
    return Number.isFinite(n) && n > 0 ? n : 1;
  }, [quantity]);

type BlockEditorSelectors = {
  getBlock: (clientId: string) => (BlockInstance & { innerBlocks?: BlockInstance[] }) | null;
};

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
      className: newClasses
    });
  }, [coreButton?.clientId, coreButton?.attributes, updateBlockAttributes]);

  useEffect(() => {
    syncInnerButton();
  }, [syncInnerButton]);

  return (
    <>
      <InspectorControls>
        <PanelBody title="Product" initialOpen>
          <ProductSelector
            value={productId ?? ''}
            onChange={(nextProductId: string) => setAttributes({ productId: nextProductId })}
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
