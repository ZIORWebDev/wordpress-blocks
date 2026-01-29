<?php
/**
 * Products Controller
 *
 * @package ZIORWebDev\WordPressBlocks\Controllers
 */

namespace ZIORWebDev\WordPressBlocks\Controllers;

use ZIORWebDev\WordPressBlocks\Utils\Cache;

/**
 * Products Controller class
 *
 * @package ZIORWebDev\WordPressBlocks\Controllers;
 * @since 1.0.0
 */
class Products extends Base {

	/**
	 * Retrieve a list of WooCommerce products.
	 *
	 * @param string $path Cache path.
	 * @param array  $args Additional arguments.
	 *
	 * @return array List of option keys.
	 */
	public static function get_products( string $path, array $args ): array {
		/**
		 * Check if WC_Product_Query exists.
		 */
		if ( ! class_exists( 'WC_Product_Query' ) ) {
			return array();
		}

		$cache_key   = static::get_cache_key( $path, $args );
		$cached_data = static::get_cache( $cache_key );

		if ( ! empty( $cached_data ) ) {
			return $cached_data;
		}

		global $wpdb;

		/**
		 * Filter the limit for option name results.
		 */
		$limit = absint( apply_filters( 'zior_wp_blocks_rest_query_limit', 50 ) );
		$args  = array(
			'status' => 'publish',
			'limit'  => $limit,
			'return' => 'ids',
		);

		// Search term.
		$search_term = $args['search'] ?? '';

		if ( ! empty( $search_term ) ) {
			$args['s'] = $search_term;
		}

		$query       = new \WC_Product_Query( $args );
		$product_ids = $query->get_products();

		$products = array();

		foreach ( $product_ids as $product_id ) {
			$products[] = array(
				'id'   => $product_id,
				'name' => get_the_title( $product_id ),
			);
		}

		// Set cache.
		static::set_cache( $cache_key, $products );

		return $products;
	}
}
