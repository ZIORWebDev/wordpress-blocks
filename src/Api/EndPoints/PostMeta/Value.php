<?php
/**
 * PostMeta endpoint
 *
 * @package ZIORWebDev\WordPressBlocks\Api\Endpoints\PostMeta
 * @since 1.0.0
 */
namespace ZIORWebDev\WordPressBlocks\Api\Endpoints\PostMeta;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * PostMeta endpoint
 *
 * @package ZIORWebDev\WordPressBlocks\Api\Endpoints\PostMeta
 * @since 1.0.0
 */
class Value extends Base {

	/**
	 * Route path
	 *
	 * @var string
	 */
	protected static $route_path = 'postmeta\value';

	/**
	 * Callback
	 *
	 * @param \WP_REST_Request $request The request.
	 * @return array The response.
	 */
	public static function callback( \WP_REST_Request $request ) {
		return rest_ensure_response(
			array(
				'value' => $value,
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
