<?php
/**
 * Editor Hook
 *
 * @package ZIORWebDev\WordPressBlocks\Hooks
 */

namespace ZIORWebDev\WordPressBlocks\Hooks;

/**
 * Editor hook class
 *
 * @package ZIORWebDev\WordPressBlocks\Hooks;
 * @since 1.0.0
 */
class Editor {

	/**
	 * Initialize action and filter hooks.
	 */
	public function init() {
		/**
		 * Filters to get meta/option values based on field providers.
		 */
		add_filter( 'zior_wp_blocks_has_subscription_support', array( $this, 'has_subscription_support' ), 10 );
		add_filter( 'zior_wp_blocks_is_woocommerce_installed', array( $this, 'is_woocommerce_installed' ), 10 );
		add_action(
			'wp_enqueue_scripts',
			function () {
				if ( ! function_exists( 'wc_enqueue_styles' ) ) {
					return; // WooCommerce not active / not loaded.
				}

				// Load only when your block exists.
				if ( is_singular() ) {
					$post = get_post();
					if ( $post && has_block( 'zior/product-rating', $post ) ) {
						wc_enqueue_styles();

						// Safety: ensure the main handle is enqueued (contains .star-rating + @font-face star).
						wp_enqueue_style( 'woocommerce-general' );
					}
				}
			},
			20
		);
	}

	/**
	 * Check if WooCommerce has subscription addon.
	 */
	public function has_subscription_support( bool $subscription_support ): bool {
		return $subscription_support;
	}

	/**
	 * Check if WooCommerce is active.
	 */
	public function is_woocommerce_installed( bool $is_installed ): bool {
		if ( class_exists( 'WooCommerce' ) ) {
			return true;
		}

		return $is_installed;
	}
}
