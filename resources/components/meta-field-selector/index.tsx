import { ComboboxControl, SelectControl } from '@wordpress/components';
import { useState, useEffect, useCallback, useMemo } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import { __ } from '@wordpress/i18n';

import { debounce } from '../../utils/debounce';

type SelectOption<V extends string = string> = {
	label: string;
	value: V;
};

type Option = {
	label: string;
	value: string;
};

type ApiResult = {
	meta_keys: string[];
};

/**
 * Single source of truth: Meta Field Type
 */
const META_FIELD_TYPE_OPTIONS = [
	{ label: __('Post Meta', 'wordpress-blocks'), value: 'post_meta' },
	{ label: __('Options', 'wordpress-blocks'), value: 'options' },
] as const satisfies readonly SelectOption<'post_meta' | 'options'>[];

type MetaFieldType = (typeof META_FIELD_TYPE_OPTIONS)[number]['value'];

const DEFAULT_META_FIELD_TYPE: MetaFieldType = 'post_meta';

function toMetaFieldType(input: string): MetaFieldType {
	return input === 'options' ? 'options' : 'post_meta';
}

/**
 * Single source of truth: Field Provider
 */
const FIELD_PROVIDER_OPTIONS = [
	{ label: __('— Select —', 'wordpress-blocks'), value: '' },
	{ label: __('ACF', 'wordpress-blocks'), value: 'acf' },
	{ label: __('Meta Box', 'wordpress-blocks'), value: 'metabox' },
	{ label: __('Pods', 'wordpress-blocks'), value: 'pods' },
	{ label: __('Carbon Field', 'wordpress-blocks'), value: 'carbon_field' },
] as const satisfies readonly SelectOption<
	'' | 'acf' | 'metabox' | 'pods' | 'carbon_field'
>[];

type FieldProviderValue = (typeof FIELD_PROVIDER_OPTIONS)[number]['value'];
// If you truly need arbitrary custom strings too, use:
// type FieldProviderValue = (typeof FIELD_PROVIDER_OPTIONS)[number]['value'] | (string & {});

type Attributes = {
	fieldProvider?: FieldProviderValue;
	[key: string]: unknown;
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
	metaFieldType: propMetaFieldType = DEFAULT_META_FIELD_TYPE,
}: Props) {
	const [metaFieldType, setMetaFieldType] = useState<MetaFieldType>(
		propMetaFieldType ?? DEFAULT_META_FIELD_TYPE
	);
	const [metaKey, setMetaKey] = useState<string>(value ?? '');
	const [options, setOptions] = useState<Option[]>([]);
	const [searchTerm, setSearchTerm] = useState<string>('');

	// --- Sync props with internal state (avoid loops) ---
	useEffect(() => {
		if (propMetaFieldType && propMetaFieldType !== metaFieldType) {
			setMetaFieldType(propMetaFieldType);
		}
		if (value !== undefined && value !== metaKey) {
			setMetaKey(value ?? '');
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [propMetaFieldType, value]);

	// --- Notify parent ---
	useEffect(() => onChange(metaKey), [metaKey, onChange]);
	useEffect(() => onTypeChange(metaFieldType), [metaFieldType, onTypeChange]);

	const fetchOptions = useCallback(
		debounce((search: string) => {
			apiFetch({
				path: `${ZIORWPBlocks.restUrl}/${metaFieldType}/lists/?search=${encodeURIComponent(
					search ?? ''
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
		[metaFieldType]
	);

	useEffect(() => fetchOptions(searchTerm), [searchTerm, fetchOptions]);

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
				label={__('Meta Field Type', 'wordpress-blocks')}
				value={metaFieldType}
				options={META_FIELD_TYPE_OPTIONS as unknown as SelectOption[]}
				onChange={(next: string) => {
					setMetaFieldType(toMetaFieldType(next));
					setMetaKey('');
					setOptions([]);
				}}
			/>

			{/* Meta Key */}
			<div className="components-base-control">
        <ComboboxControl
          label={__('Meta Key', 'wordpress-blocks')}
          value={metaKey}
          options={displayedOptions}
          onChange={(next?: string | null) => {
            setMetaKey(next ?? '');
          }}
          onFilterValueChange={(term: string) => setSearchTerm(term)}
          placeholder={__('Type to search meta keys...', 'wordpress-blocks')}
        />
				<p className="components-base-control__help">
					{__(
						'Only choose meta keys safe for public display. Avoid private values such as user data, tokens, or license keys.',
						'wordpress-blocks'
					)}
				</p>
			</div>

			{/* Field Provider */}
			<div className="components-base-control">
				<SelectControl
					label={__('Field Provider', 'wordpress-blocks')}
					value={attributes.fieldProvider ?? ''}
					options={FIELD_PROVIDER_OPTIONS as unknown as SelectOption[]}
					onChange={(selected: string) =>
						setAttributes({ fieldProvider: selected as FieldProviderValue })
					}
				/>
				<p className="components-base-control__help">
					{__('Select field provider to properly parse meta value.', 'wordpress-blocks')}
				</p>
			</div>
		</>
	);
}
