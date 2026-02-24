// components/product-selector/index.tsx
import type { FC } from 'react';
import { useState, useEffect, useCallback, useMemo, useRef } from '@wordpress/element';
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

export interface ProductSelectorProps {
	value?: string | number | null;
	onChange?: (value: string) => void;
}

/**
 * Globals provided by WP / plugin.
 */
/* eslint-disable @typescript-eslint/naming-convention */
declare const ZIORWPBlocks: { restUrl: string };
/* eslint-enable @typescript-eslint/naming-convention */

/**
 * Exportable fetcher that returns options as a Promise.
 * Note: This does NOT debounce by itself.
 */
export async function fetchOptions(
	search: unknown,
	productId: unknown
): Promise<ComboboxOption[]> {
	const params = new URLSearchParams();
	params.set('search', String(search ?? ''));
	params.set('productId', String(productId ?? ''));

	const results = await apiFetch<ProductsListResponse>({
		path: `/${ZIORWPBlocks.restUrl}/products/lists?${params.toString()}`,
	});

	const products = results?.products ?? [];
	return products.map((p) => ({
		label: p.name,
		value: String(p.id),
	}));
}

const ProductSelector: FC<ProductSelectorProps> = ({ value = '', onChange = () => {} }) => {
	const [product, setProduct] = useState<string>(String(value));
	const [options, setOptions] = useState<ComboboxOption[]>([]);
	const [searchTerm, setSearchTerm] = useState<string>('');

	// Sync prop -> state without loops
	useEffect(() => {
		const next = String(value);
		setProduct((prev) => (prev === next ? prev : next));
	}, [value]);

	const reqSeqRef = useRef(0);

	// Debounced wrapper used by the component.
	const fetchOptionsDebounced = useMemo(() => {
		return debounce(async (search: unknown, productId: unknown) => {
			const seq = ++reqSeqRef.current;

			try {
				const nextOptions = await fetchOptions(search, productId);

				// ignore stale responses
				if (seq !== reqSeqRef.current) return;

				setOptions(nextOptions);
			} catch {
				if (seq !== reqSeqRef.current) return;
				setOptions([]);
			}
		}, 300);
	}, []);

	useEffect(() => {
		fetchOptionsDebounced(searchTerm, product);
		// If your debounce supports cancel:
		// return () => fetchOptionsDebounced.cancel?.();
	}, [searchTerm, product, fetchOptionsDebounced]);

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
				onChange={(val) => {
					const next = String(val);
					setProduct(next);
					onChange(next);
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
