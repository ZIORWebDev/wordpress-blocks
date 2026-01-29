const { ComboboxControl } = wp.components;
const { useState, useEffect, useMemo } = wp.element;
const apiFetch = wp.apiFetch;
const { __ } = wp.i18n;

export default function ProductSelector({ value = '', onChange = () => {} }) {
  const [options, setOptions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const metaKey = value;
  const setMetaKey = onChange;

  useEffect(() => {
    const controller = new AbortController();

    apiFetch({
      path: `/wp-json/wc/woopress-license-hub/license-products?search=${searchTerm}`,
      signal: controller.signal,
    })
      .then((results) =>
        setOptions(results.map((key) => ({ label: key, value: key })))
      )
      .catch(() => setOptions([]));

    return () => controller.abort();
  }, [searchTerm]);

  const displayedOptions = useMemo(() => {
    if (!metaKey) return options;
    return options.some((o) => o.value === metaKey)
      ? options
      : [{ label: metaKey, value: metaKey }, ...options];
  }, [options, metaKey]);

  return (
    <ComboboxControl
      label={__('Product', 'woopress-license-hub')}
      value={metaKey}
      options={displayedOptions}
      onChange={setMetaKey}
      onFilterValueChange={setSearchTerm}
      placeholder={__('Type to search products…')}
    />
  );
}
