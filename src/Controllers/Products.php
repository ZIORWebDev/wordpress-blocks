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

		/*
		* Sanitize incoming args (treat as untrusted).
		* Note: wp_unslash() is safe even if values aren't slashed.
		*/
		$search_term_raw = '';

		if ( isset( $args['search'] ) && is_scalar( $args['search'] ) ) {
			$search_term_raw = (string) $args['search'];
		}

		$search_term = sanitize_text_field( wp_unslash( $search_term_raw ) );
		$include_id  = 0;

		if ( isset( $args['productId'] ) ) {
			$include_id = absint( $args['productId'] );
		}

		// Use sanitized args for cache key consistency.
		$cache_args = array(
			'search'    => $search_term,
			'productId' => $include_id,
		);

		$cache_key   = static::get_cache_key( $path, $cache_args );
		$cached_data = static::get_cache( $cache_key );

		if ( ! empty( $cached_data ) && is_array( $cached_data ) ) {
			return $cached_data;
		}

		/**
		 * Filter the limit for product results.
		 */
		$limit = absint( apply_filters( 'zior_wp_blocks_rest_query_limit', 50 ) );

		$query_args = array(
			'status' => 'publish',
			'limit'  => $limit,
			'return' => 'ids',
		);

		// Search term.
		if ( ! empty( $search_term ) ) {
			$query_args['s'] = $search_term;
		}

		$query       = new \WC_Product_Query( $query_args );
		$product_ids = $query->get_products();

		if ( ! is_array( $product_ids ) ) {
			$product_ids = array();
		}

		/**
		 * If productId is present, include it in the results if it's a published product.
		 * This ensures the selected product is available even if it doesn't match the search term.
		 */
		if ( $include_id > 0 && ! in_array( $include_id, $product_ids, true ) ) {
			array_unshift( $product_ids, $include_id );
		}

		// Normalize IDs, unique, and enforce limit.
		$product_ids = array_map( 'absint', $product_ids );
		$product_ids = array_values( array_unique( $product_ids ) );
		$product_ids = array_slice( $product_ids, 0, $limit );

		$products = array();

		foreach ( $product_ids as $product_id ) {
			// Extra hardening: ensure result items are still published products.
			if ( 'product' !== get_post_type( $product_id ) || 'publish' !== get_post_status( $product_id ) ) {
				continue;
			}

			$title = get_the_title( $product_id );
			if ( empty( $title ) ) {
				continue;
			}

			$products[] = array(
				'id'   => $product_id,
				'name' => $title,
			);
		}

		// Set cache.
		static::set_cache( $cache_key, $products );

		return $products;
	}
}
