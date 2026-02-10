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
