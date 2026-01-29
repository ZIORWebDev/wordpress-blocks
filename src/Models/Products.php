<?php
/**
 * Products Model
 *
 * @package ZIORWebDev\WordPressBlocks\Models
 */

namespace ZIORWebDev\WordPressBlocks\Models;

use ZIORWebDev\WordPressBlocks\Utils\Cache;

/**
 * Products Model class
 *
 * @package ZIORWebDev\WordPressBlocks\Models;
 * @since 1.0.0
 */
class Products extends Models\Base {
	/**
	 * Retrieve a value by key.
	 *
	 * @param string $key Data key to retrieve.
	 * @return mixed The resolved value, or null if the key does not exist.
	 */
	public function get_value( string $key ): mixed {
	}

	/**
	 * Retrieve a list of WooCommerce products.
	 *
	 * @param string $path Cache path.
	 * @param array  $args Additional arguments.
	 *
	 * @return array List of option keys.
	 */
	public function get_products( string $path, array $args ): array {
		$cached_key  = $this->get_cache_key( $path, $args );
		$cached_data = $this->get_cache( $cache_key );

		if ( false !== $cached_data ) {
			return $cached_data;
		}

		global $wpdb;

		/**
		 * Filter the limit for option name results.
		 */
		$limit = absint( apply_filters( 'wordpress_blocks_rest_query_limit', 50 ) );
		$args  = array(
			'status' => 'publish',
			'limit'  => $limit,
			'return' => 'ids',
		);

		// Search term.
		$search_term = $args['search'] ?: '';

		if ( ! empty( $search_term ) ) {
			$args['s'] = $search_term;
		}

		$query       = new WC_Product_Query( $args );
		$product_ids = $query->get_products();

		$products = array();

		foreach ( $product_ids as $product_id ) {
			$products[] = array(
				'id'   => $product_id,
				'name' => get_the_title( $product_id ),
			);
		}

		// Set cache.
		$this->set_cache( $cache_key, $products );

		return $products;
	}
}
