const { ComboboxControl } = wp.components;
const { useState, useEffect, useCallback, useMemo } = wp.element;
const apiFetch = wp.apiFetch;
const { __ } = wp.i18n;

import { debounce } from '../../utils/debounce';

export default function ProductSelector({ value = '', onChange = () => {} }) {
  const [product, setProduct] = useState(value || '');
  const [options, setOptions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Sync prop with internal state
  useEffect(() => {
    if (value !== undefined && value !== product) {
      setProduct(value || '');
    }
  }, [value]);

  // Notify parent when product changes
  useEffect(() => onChange(product), [product, onChange]);

  // Fetch product options from REST API
  const fetchOptions = useCallback(
    debounce((search) => {
      apiFetch({
        path: `${ZIORWPBlocks.restUrl}/products/lists/?search=${search}`,
        headers: { 'X-WP-Nonce': wpApiSettings.nonce },
      })
        .then((results) =>
          setOptions(
            results.products.map((product) => ({ label: product.name, value: product.id }))
          )
        )
        .catch(() => setOptions([]));
    }, 300),
    []
  );

  useEffect(() => fetchOptions(searchTerm), [searchTerm, fetchOptions]);

  // Ensure selected product is always displayed
  const displayedOptions = useMemo(() => {
    if (!product) return options;
    return options.some((o) => o.value === product)
      ? options
      : [{ label: product, value: product }, ...options];
  }, [options, product]);

  return (
    <div className="components-base-control">
      <ComboboxControl
        label={__('Product')}
        value={product}
        options={displayedOptions}
        onChange={setProduct}
        onFilterValueChange={setSearchTerm}
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
