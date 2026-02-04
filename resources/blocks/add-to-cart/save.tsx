import { InnerBlocks, useBlockProps } from '@wordpress/block-editor';

type Attributes = {
  productId?: string | number;
  showQuantity?: boolean;
  quantity?: number | string;
};

type SaveProps = {
  attributes: Attributes;
};

export default function Save({ attributes }: SaveProps) {
  const { productId, showQuantity = false, quantity = 1 } = attributes;

  const normalizedQty = (() => {
    const n = typeof quantity === 'string' ? parseInt(quantity, 10) : Number(quantity);
    return Number.isFinite(n) && n > 0 ? n : 1;
  })();

  const blockProps = useBlockProps.save({
    className: 'zior-add-to-cart',
    'data-product-id': productId ? String(productId) : '',
    'data-quantity': showQuantity ? String(normalizedQty) : '1',
    'data-show-quantity': showQuantity ? '1' : '0',
  });

  return (
    <div {...blockProps}>
      {showQuantity && (
        <input
          className="zior-add-to-cart__qty"
          type="number"
          min={1}
          step={1}
          value={normalizedQty}
          aria-label="Quantity"
        />
      )}
      <InnerBlocks.Content />
    </div>
  );
}
