import type { FC } from 'react';
import {
	useState,
	useEffect,
	useCallback,
	useMemo,
	useRef,
} from '@wordpress/element';
import { ComboboxControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

import { debounce } from '../../utils/debounce';
import { fetchProductOptions, fetchProductInformation } from './products';

type ComboboxOption = { label: string; value: string };

export type ProductAttr = {
	id: string;
	label: string;
	price?: string;
};

export type ProductInformation = {
	price_html?: string;
};

export interface ProductSelectorProps {
	value?: ProductAttr | null;
	onChange?: (value: ProductAttr) => void;
	onProductInformationChange?: (value: ProductInformation) => void;
	onProductInformationError?: (error: unknown) => void;
}

const EMPTY_PRODUCT: ProductAttr = {
	id: '',
	label: '',
	price: '',
};

const ProductSelector: FC<ProductSelectorProps> = ({
	value,
	onChange = () => {},
	onProductInformationChange = () => {},
	onProductInformationError = () => {},
}) => {
	const [product, setProduct] = useState<ProductAttr>(value ?? EMPTY_PRODUCT);
	const [options, setOptions] = useState<ComboboxOption[]>([]);
	const [searchTerm, setSearchTerm] = useState<string>('');

	const reqSeqRef = useRef(0);
	const infoReqSeqRef = useRef(0);

	const controlWrapRef = useRef<HTMLDivElement | null>(null);

	const onChangeRef = useRef(onChange);
	const onProductInformationChangeRef = useRef(onProductInformationChange);
	const onProductInformationErrorRef = useRef(onProductInformationError);

	const lastInfoProductIdRef = useRef<string>('');
	const lastInfoPriceRef = useRef<string>('');

	useEffect(() => {
		onChangeRef.current = onChange;
	}, [onChange]);

	useEffect(() => {
		onProductInformationChangeRef.current = onProductInformationChange;
	}, [onProductInformationChange]);

	useEffect(() => {
		onProductInformationErrorRef.current = onProductInformationError;
	}, [onProductInformationError]);

	useEffect(() => {
		const nextValue = value ?? EMPTY_PRODUCT;
		const currentId = product?.id ?? '';
		const currentLabel = product?.label ?? '';
		const nextId = nextValue?.id ?? '';
		const nextLabel = nextValue?.label ?? '';
		const nextPrice = nextValue?.price ?? '';
		const currentPrice = product?.price ?? '';

		if (
			currentId !== nextId ||
			currentLabel !== nextLabel ||
			currentPrice !== nextPrice
		) {
			setProduct(nextValue);
		}
	}, [value, product]);

	const blurCombobox = useCallback(() => {
		const input = controlWrapRef.current?.querySelector('input');
		input?.blur();
	}, []);

	const fetchOptionsDebounced = useMemo(() => {
		return debounce(async (search: string, productId: string) => {
			const seq = ++reqSeqRef.current;

			try {
				const results = await fetchProductOptions(search, productId);

				if (seq !== reqSeqRef.current) {
					return;
				}

				const products = results?.products ?? [];

				setOptions(
					products.map((item: { id: string | number; name: string }) => ({
						label: item.name,
						value: String(item.id),
					}))
				);
			} catch {
				if (seq !== reqSeqRef.current) {
					return;
				}

				setOptions([]);
			}
		}, 300);
	}, []);

	useEffect(() => {
		fetchOptionsDebounced(searchTerm, product.id);
	}, [searchTerm, product.id, fetchOptionsDebounced]);

	useEffect(() => {
		const productId = String(product?.id ?? '');

		if (!productId) {
			lastInfoProductIdRef.current = '';
			lastInfoPriceRef.current = '';
			return;
		}

		let isMounted = true;
		const seq = ++infoReqSeqRef.current;

		const loadProductInformation = async () => {
			try {
				const info = await fetchProductInformation(productId);

				if (!isMounted || seq !== infoReqSeqRef.current) {
					return;
				}

				const nextPrice = info?.price_html ?? '';
				const lastProductId = lastInfoProductIdRef.current;
				const lastPrice = lastInfoPriceRef.current;

				if (lastProductId === productId && lastPrice === nextPrice) {
					return;
				}

				lastInfoProductIdRef.current = productId;
				lastInfoPriceRef.current = nextPrice;

				onProductInformationChangeRef.current({
					price_html: nextPrice,
				});
			} catch (error) {
				if (!isMounted || seq !== infoReqSeqRef.current) {
					return;
				}

				onProductInformationErrorRef.current(error);
			}
		};

		loadProductInformation();

		return () => {
			isMounted = false;
		};
	}, [product.id]);

	const displayedOptions = useMemo<ComboboxOption[]>(() => {
		const productId = String(product?.id ?? '');

		if (!productId) {
			return options;
		}

		if (options.some((option) => option.value === productId)) {
			return options;
		}

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
					const selected = displayedOptions.find(
						(option) => option.value === id
					);

					const nextProduct: ProductAttr = {
						id,
						label: selected?.label ?? '',
						price: '',
					};

					const currentId = String(product?.id ?? '');
					const currentLabel = product?.label ?? '';

					if (
						currentId === nextProduct.id &&
						currentLabel === nextProduct.label
					) {
						requestAnimationFrame(() => blurCombobox());
						return;
					}

					setProduct(nextProduct);
					onChangeRef.current(nextProduct);

					requestAnimationFrame(() => blurCombobox());
				}}
				onFilterValueChange={(val) => {
					setSearchTerm(String(val ?? ''));
				}}
				placeholder={__('Type to search products...')}
			/>

			<p className="components-base-control__help">
				{__('Only choose products safe for public display.')}
			</p>
		</div>
	);
};

export default ProductSelector;