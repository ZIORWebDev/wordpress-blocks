// MetaFieldSelector.tsx
const { ComboboxControl, SelectControl } = wp.components;
const { useState, useEffect, useCallback, useMemo } = wp.element;
const apiFetch = wp.apiFetch;
const { __ } = wp.i18n;

import { debounce } from '../../utils/debounce';

type MetaFieldType = 'post_meta' | 'options';

type Option = {
  label: string;
  value: string;
};

type Attributes = {
  fieldProvider?: '' | 'acf' | 'metabox' | 'pods' | 'carbon_field' | string;
  // allow other block attributes too
  [key: string]: unknown;
};

type ApiResult = {
  meta_keys: string[];
};

type Props = {
  value?: string;
  onChange?: (value: string) => void;
  onTypeChange?: (type: MetaFieldType) => void;
  attributes?: Attributes;
  setAttributes?: (attrs: Partial<Attributes>) => void;
  metaFieldType?: MetaFieldType;
};

// WP globals you’re using
declare const ZIORWPBlocks: { restUrl: string };
declare const wpApiSettings: { nonce: string };

export default function MetaFieldSelector({
  value = '',
  onChange = () => {},
  onTypeChange = () => {},
  attributes = {},
  setAttributes = () => {},
  metaFieldType: propMetaFieldType = 'post_meta',
}: Props) {
  const [metaFieldType, setMetaFieldType] = useState<MetaFieldType>(
    propMetaFieldType || 'post_meta',
  );
  const [metaKey, setMetaKey] = useState<string>(value || '');
  const [options, setOptions] = useState<Option[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // --- Sync props with internal state ---
  useEffect(() => {
    if (propMetaFieldType && propMetaFieldType !== metaFieldType) {
      setMetaFieldType(propMetaFieldType);
    }
    if (value !== undefined && value !== metaKey) {
      setMetaKey(value || '');
    }
  }, [propMetaFieldType, value]); // intentionally not including metaFieldType/metaKey to avoid loops

  // --- Notify parent ---
  useEffect(() => onChange(metaKey), [metaKey, onChange]);
  useEffect(() => onTypeChange(metaFieldType), [metaFieldType, onTypeChange]);

  const fetchOptions = useCallback(
    debounce((search: string) => {
      apiFetch({
        path: `${ZIORWPBlocks.restUrl}/${metaFieldType}/lists/?search=${encodeURIComponent(
          search ?? '',
        )}`,
        headers: { 'X-WP-Nonce': wpApiSettings.nonce },
      })
        .then((results: unknown) => {
          const data = results as ApiResult;
          const list = Array.isArray(data?.meta_keys) ? data.meta_keys : [];
          setOptions(list.map((key) => ({ label: key, value: key })));
        })
        .catch(() => setOptions([]));
    }, 300),
    [metaFieldType],
  );

  useEffect(() => fetchOptions(searchTerm), [searchTerm, fetchOptions]);

  // --- Memoized displayed options ---
  const displayedOptions = useMemo<Option[]>(() => {
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
        onChange={(value: string) => {
          // SelectControl onChange gives string
          setMetaFieldType(value as MetaFieldType);
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
          onChange={(next: string | null) => setMetaKey(next ?? '')}
          onFilterValueChange={(term: string) => setSearchTerm(term)}
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
          value={(attributes.fieldProvider as string) || ''}
          options={[
            { label: '', value: '' },
            { label: 'ACF', value: 'acf' },
            { label: 'Meta Box', value: 'metabox' },
            { label: 'Pods', value: 'pods' },
            { label: 'Carbon Field', value: 'carbon_field' },
          ]}
          onChange={(selected: string) => setAttributes({ fieldProvider: selected })}
        />
        <p className="components-base-control__help">
          {__('Select field provider to properly parse meta value.')}
        </p>
      </div>
    </>
  );
}
