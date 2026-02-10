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
	 * @param array $args Additional arguments.
	 * @return array List of option keys.
	 */
	public static function get_products( array $args ): array {
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

		return apply_filters( 'zior_wp_blocks_get_products', $products, $args );
	}

	/**
	 * Get product information.
	 *
	 * @param string $product_id Product Id.
	 * @param array  $args Additional arguments.
	 * @return array Product data.
	 */
	public static function get_product( string $product_id, array $args = array() ): array {
		if ( empty( $product_id ) ) {
			return array();
		}

		/**
		 * If WooCommerce not active, return empty array.
		 */
		if ( ! function_exists( 'wc_get_product' ) ) {
			return $array();
		}

		$product = wc_get_product( $product_id );

		if ( ! $product ) {
			return array();
		}

		$product_data = array(
			'id'             => $product->get_id(),
			'name'           => $product->get_name(),
			'slug'           => $product->get_slug(),
			'permalink'      => $product->get_permalink(),
			'status'         => $product->get_status(),
			'type'           => $product->get_type(),
			'price'          => $product->get_price(),
			'regular_price'  => $product->get_regular_price(),
			'sale_price'     => $product->get_sale_price(),
			'on_sale'        => $product->is_on_sale(),
			'price_html'     => $product->get_price_html(),
			'description'    => $product->get_short_description(),
			'average_rating' => $product->get_average_rating(),
			'review_count'   => $product->get_review_count(),
			'rating_count'   => $product->get_rating_count(),
		);

		return apply_filters( 'zior_wp_blocks_get_product', $product_data, $product );
	}
}
