const { ComboboxControl, SelectControl } = wp.components;
const { useState, useEffect, useCallback, useMemo } = wp.element;
const apiFetch = wp.apiFetch;
const { select } = wp.data;
const { __ } = wp.i18n;

// Safe debounce implementation
const debounce = (() => {
  if (typeof window !== 'undefined') {
    if (window.wp?.lodash?.debounce) return window.wp.lodash.debounce;
    if (window.lodash?.debounce) return window.lodash.debounce;
    if (window._?.debounce) return window._.debounce;
  }
  return (func, wait = 0) => {
    let timeout;
    return function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  };
})();

export default function MetaFieldSelector({
  value = '',
  onChange = () => {},
  onTypeChange = () => {},
  attributes = {},
  setAttributes = () => {},
  metaFieldType: propMetaFieldType = 'post_meta',
}) {
  const [metaFieldType, setMetaFieldType] = useState(
    propMetaFieldType || 'post_meta',
  );
  const [metaKey, setMetaKey] = useState(value || '');
  const [options, setOptions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // --- Sync props with internal state ---
  useEffect(() => {
    if (propMetaFieldType && propMetaFieldType !== metaFieldType)
      setMetaFieldType(propMetaFieldType);
    if (value !== undefined && value !== metaKey) setMetaKey(value || '');
  }, [propMetaFieldType, value]);

  // --- Notify parent ---
  useEffect(() => onChange(metaKey), [metaKey, onChange]);
  useEffect(() => onTypeChange(metaFieldType), [metaFieldType, onTypeChange]);

  // --- Debounced meta key search ---
  const fetchOptions = useCallback(
    debounce((search) => {
      const provider = attributes.fieldProvider || '';
      apiFetch({
        path: `/wordpress-blocks/v1/meta-keys?type=${metaFieldType}&provider=${provider}&search=${search}`,
        headers: { 'X-WP-Nonce': wpApiSettings.nonce },
      })
        .then((results) =>
          setOptions(results.map((key) => ({ label: key, value: key }))),
        )
        .catch(() => setOptions([]));
    }, 300),
    [metaFieldType, attributes.fieldProvider],
  );

  useEffect(() => fetchOptions(searchTerm), [searchTerm, fetchOptions]);

  // --- Memoized displayed options ---
  const displayedOptions = useMemo(() => {
    if (!metaKey) return options;
    return options.some((o) => o.value === metaKey)
      ? options
      : [{ label: metaKey, value: metaKey }, ...options];
  }, [options, metaKey]);

  // --- Debounced fetch of meta value ---
  const fetchMetaValue = useCallback(
    debounce(async (key, fieldType, provider) => {
      if (!key) return;

      // Get current post ID from editor store
      const currentPost = select('core/editor')?.getCurrentPost();
      const postId = currentPost?.id || 0;

      try {
        const response = await apiFetch({
          path: `/wordpress-blocks/v1/meta-value?type=${fieldType}&key=${key}&post_id=${postId}&provider=${provider}`,
          headers: { 'X-WP-Nonce': wpApiSettings.nonce },
        });
        if (response?.value) setAttributes({ content: response.value });
      } catch {
        setAttributes({ content: '' });
      }
    }, 300),
    [setAttributes],
  );

  useEffect(() => {
    if (!metaKey) return;
    fetchMetaValue(metaKey, metaFieldType, attributes.fieldProvider || '');
  }, [metaKey, metaFieldType, attributes.fieldProvider, fetchMetaValue]);

  return (
    <>
      {/* Meta Field Type */}
      <SelectControl
        label={__('Meta Field Type')}
        value={metaFieldType}
        options={[
          { label: __('Post Meta'), value: 'post_meta' },
          { label: __('Options'), value: 'options' },
        ]}
        onChange={(value) => {
          setMetaFieldType(value);
          setMetaKey('');
          setOptions([]);
        }}
      />

      {/* Meta Key */}
      <div className="components-base-control">
        <ComboboxControl
          label={__('Meta Key')}
          value={metaKey}
          options={displayedOptions}
          onChange={setMetaKey}
          onFilterValueChange={setSearchTerm}
          placeholder={__('Type to search meta keys...')}
        />
        <p className="components-base-control__help">
          {__(
            'Only choose meta keys safe for public display. Avoid private values such as user data, tokens, or license keys.',
          )}
        </p>
      </div>
      {/* Field Provider */}
      <div className="components-base-control">
        <SelectControl
          label={__('Field Provider')}
          value={attributes.fieldProvider || ''}
          options={[
            { label: '', value: '' },
            { label: 'ACF', value: 'acf' },
            { label: 'Meta Box', value: 'metabox' },
            { label: 'Pods', value: 'pods' },
            { label: 'Carbon Field', value: 'carbon_field' },
          ]}
          onChange={(selected) => setAttributes({ fieldProvider: selected })}
        />
        <p className="components-base-control__help">
          {__('Select field provider to properly parse meta value.')}
        </p>
      </div>
    </>
  );
}
