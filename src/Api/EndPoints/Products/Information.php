<?php
/**
 * Products Lists endpoint
 *
 * @package ZIORWebDev\WordPressBlocks\Api\EndPoints\Products
 * @since 1.0.0
 */
namespace ZIORWebDev\WordPressBlocks\Api\EndPoints\Products;

use ZIORWebDev\WordPressBlocks\Api\EndPoints;
use ZIORWebDev\WordPressBlocks\Controllers\Products as ProductsController;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Products Lists endpoint
 *
 * @package ZIORWebDev\WordPressBlocks\Api\EndPoints\Products
 * @since 1.0.0
 */
class Information extends EndPoints\Base {

	/**
	 * Route path
	 *
	 * @var string
	 */
	protected $route_path = 'products/information';

	/**
	 * Callback
	 *
	 * @param \WP_REST_Request $request The request.
	 * @return array The response.
	 */
	public function callback( \WP_REST_Request $request ) {
		$path   = $this->get_rest_path();
		$params = $request->get_params();

		/**
		 * Sort params for cache key consistency.
		 */
		ksort( $params );

		/**
		 * Get cache and return if exists.
		 */
		$cache_key   = static::get_cache_key( $path, $params );
		$cached_data = static::get_cache( $cache_key );

		if ( ! empty( $cached_data ) && is_array( $cached_data ) ) {
			return rest_ensure_response(
				array(
					'product' => $cached_data,
				)
			);
		}

		$product    = array();
		$product_id = isset( $params['productId'] ) ? $params['productId'] : null;

		if ( ! empty( $product_id ) ) {
			$product = ProductsController::get_product( $product_id, $params );
		}

		/**
		 * Save cache.
		 */
		static::set_cache( $cache_key, $product );

		return rest_ensure_response(
			array(
				'product' => $product,
			)
		);
	}

	/**
	 * Get REST args
	 *
	 * @return array The REST args.
	 */
	public function get_rest_args() {
		return array(
			'productId' => array(
				'type'              => 'string',
				'required'          => true,
				'sanitize_callback' => 'sanitize_text_field',
			),
		);
	}

	/**
	 * Get REST method
	 *
	 * @return string The REST method.
	 */
	public function get_rest_method() {
		return \WP_REST_Server::READABLE;
	}
}
