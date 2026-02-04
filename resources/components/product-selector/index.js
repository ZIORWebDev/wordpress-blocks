const { ComboboxControl } = wp.components;
const { useState, useEffect, useCallback, useMemo } = wp.element;
const apiFetch = wp.apiFetch;
const { __ } = wp.i18n;

import { debounce } from '../../utils/debounce';

const toStr = (v) => (v === null || v === undefined ? '' : String(v));

export default function ProductSelector({ value = '', onChange = () => {} }) {
  const [product, setProduct] = useState(toStr(value));
  const [options, setOptions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  /**
   * Improvement #1:
   * Correct sync effect deps without creating loops.
   * (Uses functional state update, so it doesn't need `product` in deps.)
   */
  useEffect(() => {
    setProduct((prev) => {
      const next = toStr(value);
      return prev === next ? prev : next;
    });
  }, [value]);

  // Notify parent when product changes
  useEffect(() => onChange(product), [product, onChange]);

  /**
   * Improvement #2:
   * Use a RELATIVE REST path with apiFetch.
   * Let apiFetch middleware handle the WP REST root + nonce automatically.
   */
  const fetchOptions = useCallback(
    debounce((search) => {
      apiFetch({
        path: `/wordpress-blocks/v1/products/lists?search=${encodeURIComponent(
          toStr(search)
        )}`,
      })
        .then((results) => {
          const products = results?.products || [];
          setOptions(
            products.map((p) => ({
              label: p.name,
              value: String(p.id), // ensure string for ComboboxControl
            }))
          );
        })
        .catch(() => setOptions([]));
    }, 300),
    []
  );

  useEffect(() => {
    fetchOptions(searchTerm);
  }, [searchTerm, fetchOptions]);

  // Ensure selected product is always displayed
  const displayedOptions = useMemo(() => {
    if (!product) return options;
    return options.some((o) => o.value === product)
      ? options
      : [{ label: `#${product}`, value: product }, ...options];
  }, [options, product]);

  return (
    <div className="components-base-control">
      <ComboboxControl
        label={__('Product')}
        value={product} // always a string
        options={displayedOptions}
        onChange={(val) => setProduct(toStr(val))}
        onFilterValueChange={(val) => setSearchTerm(toStr(val))}
        placeholder={__('Type to search products...')}
      />
      <p className="components-base-control__help">
        {__(
          'Only choose products safe for public display. Avoid private values such as user data or tokens.'
        )}
      </p>
    </div>
  );
}
