const { ComboboxControl, SelectControl } = wp.components;
const { useState, useEffect, useCallback, useMemo } = wp.element;
const apiFetch = wp.apiFetch;
const { __ } = wp.i18n;

import { debounce } from '../../utils/debounce';

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

  const fetchOptions = useCallback(
    debounce((search) => {
      apiFetch({
        path: `${ZIORWPBlocks.restUrl}/${metaFieldType}/lists/?search=${search}`,
        headers: { 'X-WP-Nonce': wpApiSettings.nonce },
      })
        .then((results) =>
          setOptions(results.meta_keys.map((key) => ({ label: key, value: key }))),
        )
        .catch(() => setOptions([]));
    }, 300),
    [metaFieldType],
  );

  useEffect(() => fetchOptions(searchTerm), [searchTerm, fetchOptions]);

  // --- Memoized displayed options ---
  const displayedOptions = useMemo(() => {
    if (!metaKey) return options;
    return options.some((o) => o.value === metaKey)
      ? options
      : [{ label: metaKey, value: metaKey }, ...options];
  }, [options, metaKey]);

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
