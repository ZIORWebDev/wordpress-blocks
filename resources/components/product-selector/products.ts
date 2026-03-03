// components/product-selector/fetchProductOptions.ts
import apiFetch from '@wordpress/api-fetch';

type ProductApiProduct = { id: number | string; name: string };
export type ProductsListResponse = { products?: ProductApiProduct[] };

declare const ZIORWPBlocks: {
  restUrl: string;
  queries?: Record<string, ProductsListResponse>;
};

const hashString = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
};

const buildQuery = (search: unknown, productId: unknown) => {
  const params = new URLSearchParams();
  params.set('search', String(search ?? '').trim().toLowerCase());
  params.set('productId', String(productId ?? ''));
  return `products/lists?${params.toString()}`;
};

export async function fetchProductOptions(
  search: unknown,
  productId: unknown
): Promise<ProductsListResponse> {
  const query = buildQuery(search, productId);
  const key = hashString(query);

  ZIORWPBlocks.queries = ZIORWPBlocks.queries || {};

  const cached = ZIORWPBlocks.queries[key];
  if (cached) return cached;

  const results = await apiFetch<ProductsListResponse>({
    path: `/${ZIORWPBlocks.restUrl}/${query}`,
  });

  ZIORWPBlocks.queries[key] = results;

  return results;
}