import type { FC } from 'react';
import { useState, useEffect, useCallback, useMemo } from '@wordpress/element';
import { ComboboxControl } from '@wordpress/components';
import apiFetch from '@wordpress/api-fetch';
import { __ } from '@wordpress/i18n';

import { debounce } from '../../utils/debounce';

type ComboboxOption = { label: string; value: string };

type ProductApiProduct = {
	id: number | string;
	name: string;
};

type ProductsListResponse = {
	products?: ProductApiProduct[];
};

const toStr = (v: unknown): string => (v === null || v === undefined ? '' : String(v));

export interface ProductSelectorProps {
	value?: string | number | null;
	onChange?: (value: string) => void;
}

const ProductSelector: FC<ProductSelectorProps> = ({ value = '', onChange = () => { } }) => {
	const [product, setProduct] = useState<string>(toStr(value));
	const [options, setOptions] = useState<ComboboxOption[]>([]);
	const [searchTerm, setSearchTerm] = useState<string>('');

	// Sync prop -> state without loops
	useEffect(() => {
		setProduct((prev) => {
			const next = toStr(value);
			return prev === next ? prev : next;
		});
	}, [value]);

	// Notify parent when product changes
	useEffect(() => {
		onChange(product);
	}, [product, onChange]);

	const fetchOptions = useCallback(
		debounce((search: unknown) => {
			const q = encodeURIComponent(toStr(search));

			apiFetch<ProductsListResponse>({
				path: `/wordpress-blocks/v1/products/lists?search=${q}`,
			})
				.then((results) => {
					const products = results?.products ?? [];
					setOptions(
						products.map((p) => ({
							label: p.name,
							value: String(p.id),
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
	const displayedOptions = useMemo<ComboboxOption[]>(() => {
		if (!product) return options;
		return options.some((o) => o.value === product)
			? options
			: [{ label: `#${product}`, value: product }, ...options];
	}, [options, product]);

	return (
		<div className="components-base-control">
			<ComboboxControl
				label={__('Product')}
				value={product}
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
};

export default ProductSelector;
