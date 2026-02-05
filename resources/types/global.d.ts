export {};

declare global {
	interface Window {
		wc_add_to_cart_params?: {
			wc_ajax_url?: string;
		};
		jQuery?: any;
	}
}
