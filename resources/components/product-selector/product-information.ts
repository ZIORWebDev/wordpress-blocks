import apiFetch from '@wordpress/api-fetch';

export type ProductInformation = {
	id: number | string;
	name?: string;
	slug?: string;
	permalink?: string;
	status?: string;
	type?: string;
	price?: string;
	regular_price?: string;
	sale_price?: string;
	on_sale?: boolean;
	price_html?: string;
	description?: string;
	average_rating?: string;
	review_count?: number;
	rating_count?: number;
	rating_html?: string;
};

type FetchProductResponse = { product?: ProductInformation };

declare const ZIORWPBlocks: {
	restUrl: string;
	products?: Record<string, ProductInformation>;
};

declare const wpApiSettings: { nonce: string };

export async function fetchProductInformation(
	productId: string
): Promise<ProductInformation | null> {
	if (!productId) return null;

	// Ensure cache container exists
	ZIORWPBlocks.products = ZIORWPBlocks.products || {};
	productId = String(productId);

	// Return cached version if exists
	if (ZIORWPBlocks.products[productId]) {
		return ZIORWPBlocks.products[productId];
	}

	const params = new URLSearchParams({ productId: productId });
	const path = `/${ZIORWPBlocks.restUrl}/products/information?${params.toString()}`;

	const res = (await apiFetch({
		path,
		headers: { 'X-WP-Nonce': wpApiSettings.nonce },
	})) as FetchProductResponse;

	const product = res?.product ?? null;

	// Save to cache
	if (product) {
		ZIORWPBlocks.products[productId] = product;
	}

	return product;
}