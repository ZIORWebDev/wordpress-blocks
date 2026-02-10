export {};

declare global {
	/**
	 * Globals injected via wp_localize_script / wp_add_inline_script
	 */
	const ZIORWPBlocks: {
		restUrl: string;
	};

	const wpApiSettings: {
		nonce: string;
	};

	interface Window {
		/**
		 * WooCommerce localized script params
		 * (from wc-add-to-cart.js)
		 */
		wc_add_to_cart_params?: Readonly<{
			wc_ajax_url?: string;
			cart_url?: string;
			is_cart?: string;
			cart_redirect_after_add?: string;
		}>;

		/**
		 * Global jQuery object (WordPress)
		 */
		jQuery?: JQueryStatic;
		$?: JQueryStatic;
	}
}
