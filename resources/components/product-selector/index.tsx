import type { FC } from 'react';
import { useState, useEffect, useCallback, useMemo, useRef } from '@wordpress/element';
import { ComboboxControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

import { debounce } from '../../utils/debounce';
import { fetchProductOptions } from './products';

type ComboboxOption = { label: string; value: string };
type ProductAttr = { id: string; label: string };

export interface ProductSelectorProps {
  value?: ProductAttr | null;
  onChange?: (value: ProductAttr) => void;
}

const EMPTY_PRODUCT: ProductAttr = { id: '', label: '' };

const ProductSelector: FC<ProductSelectorProps> = ({ value, onChange = () => {} }) => {
  const [product, setProduct] = useState<ProductAttr>(value ?? EMPTY_PRODUCT);
  const [options, setOptions] = useState<ComboboxOption[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    setProduct(value ?? EMPTY_PRODUCT);
  }, [value?.id, value?.label]);

  const reqSeqRef = useRef(0);

  const controlWrapRef = useRef<HTMLDivElement | null>(null);
  const blurCombobox = useCallback(() => {
    const input = controlWrapRef.current?.querySelector('input');
    input?.blur();
  }, []);

  // Exportable fetcher is wrapped here (debounce + stale guard)
  const fetchOptions = useMemo(() => {
    return debounce(async (search: unknown, productId: unknown) => {
      const seq = ++reqSeqRef.current;

      try {
        const results = await fetchProductOptions(search, productId);
        if (seq !== reqSeqRef.current) return;

        const products = results?.products ?? [];
        setOptions(products.map((p) => ({ label: p.name, value: String(p.id) })));
      } catch {
        if (seq !== reqSeqRef.current) return;
        setOptions([]);
      }
    }, 300);
  }, []);

  useEffect(() => {
    fetchOptions(searchTerm, product.id);
  }, [searchTerm, fetchOptions]);

  const displayedOptions = useMemo<ComboboxOption[]>(() => {
    const productId = product?.id ? String(product.id) : '';
    if (!productId) return options;

    if (options.some((o) => o.value === productId)) return options;

    const label = (product?.label ?? '').trim() || `#${productId}`;
    return [{ label, value: productId }, ...options];
  }, [options, product.id, product.label]);

  return (
    <div className="components-base-control" ref={controlWrapRef}>
      <ComboboxControl
        label={__('Product')}
        value={product.id}
        options={displayedOptions}
        onChange={(val) => {
          const id = String(val ?? '');
          const selected = displayedOptions.find((o) => o.value === id);

          const newProduct: ProductAttr = { id, label: selected?.label || '' };
          setProduct(newProduct);
          onChange(newProduct);

          requestAnimationFrame(() => blurCombobox());
        }}
        onFilterValueChange={(val) => setSearchTerm(String(val))}
        placeholder={__('Type to search products...')}
      />
      <p className="components-base-control__help">
        {__('Only choose products safe for public display.')}
      </p>
    </div>
  );
};

export default ProductSelector;