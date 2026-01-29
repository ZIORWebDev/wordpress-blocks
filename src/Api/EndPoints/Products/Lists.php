<?php
/**
 * Products Lists endpoint
 *
 * @package ZIORWebDev\WordPressBlocks\Api\Endpoints\Products
 * @since 1.0.0
 */
namespace ZIORWebDev\WordPressBlocks\Api\Endpoints\Products;

use ZIORWebDev\WordPressBlocks\Models\Products as ProductsModel;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Products Lists endpoint
 *
 * @package ZIORWebDev\WordPressBlocks\Api\Endpoints\Products
 * @since 1.0.0
 */
class Lists extends Base {

	/**
	 * Route path
	 *
	 * @var string
	 */
	protected static $route_path = 'products\lists';

	/**
	 * Callback
	 *
	 * @param \WP_REST_Request $request The request.
	 * @return array The response.
	 */
	public static function callback( \WP_REST_Request $request ) {
		$path     = self::get_rest_path();
		$params   = $request->get_params();
		$model    = new ProductsModel();
		$products = $model->get_products( $path, $params );

		return rest_ensure_response(
			array(
				'products' => $products,
			)
		);
	}

	/**
	 * Get REST args
	 *
	 * @return array The REST args.
	 */
	public static function get_rest_args() {
		return array();
	}

	/**
	 * Get REST method
	 *
	 * @return string The REST method.
	 */
	public static function get_rest_method() {
		return \WP_REST_Server::READABLE;
	}
}
