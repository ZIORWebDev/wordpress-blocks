<?php
/**
 * Base class
 *
 * @package ZIORWebDev\WordPressBlocks\Api\Endpoints
 * @since 1.0.0
 */
namespace ZIORWebDev\WordPressBlocks\Api\Endpoints;

use ZIORWebDev\WordPressBlocks\Api\Routes;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Base class
 *
 * @since 1.0.0
 * @package ZIORWebDev\WordPressBlocks\Api\Endpoints
 */
abstract class Base implements Interface\Route {

	/**
	 * REST route path
	 *
	 * @var string
	 */
	protected static $route_path = null;

	/**
	 * Check if the Nonce is valid
	 *
	 * @param \WP_REST_Request $request
	 * @return boolean
	 */
	protected static function is_valid_nonce( \WP_REST_Request $request ): bool {
		$nonce = $request->get_header( 'x-wp-nonce' );

		return $nonce && wp_verify_nonce( $nonce, 'wp_rest' );
	}

	/**
	 * Class constructor
	 *
	 * @since 1.0.0
	 */
	public function __construct() {
		register_rest_route(
			Routes::get_namespace(),
			static::get_rest_path(),
			array(
				'args'                => static::get_rest_args(),
				'methods'             => static::get_rest_method(),
				'callback'            => array( static::class, 'callback' ),
				'permission_callback' => array( static::class, 'get_rest_permission' ),
			)
		);

		Routes::get_instance()->register( $this );
	}

	/**
	 * Get Rest path and method
	 *
	 * @return string
	 */
	public static function get_name() {
		$path   = static::get_rest_path();
		$method = strtolower( static::get_rest_method() );

		return "$path/$method";
	}

	/**
	 * Get REST route path
	 *
	 * @since 1.0.0
	 * @return string
	 */
	public static function get_rest_path() {
		return static::$route_path;
	}

	/**
	 * Get REST args
	 *
	 * @since 1.0.0
	 * @return array
	 */
	public static function get_rest_args() {
		return array();
	}

	/**
	 * Get RESt URL
	 *
	 * @since 1.0.0
	 * @return string
	 */
	public static function get_rest_url() {
		$blog_id   = get_current_blog_id();
		$namespace = Routes::get_namespace();
		$path      = static::get_rest_path();

		return get_rest_url( $blog_id, "{$namespace}/$path" );
	}

	/**
	 * Get REST permission
	 *
	 * @since 1.0.0
	 * @return boolean|\WP_Error
	 */
	public static function get_rest_permission( \WP_REST_Request $request ) {
		if ( self::is_valid_nonce( $request ) ) {
			return true;
		}

		return new \WP_Error( 'rest_forbidden', __( 'Permission denied.' ), array( 'status' => 403 ) );
	}

	/**
	 * Sanitize keys.
	 *
	 * @param array $keys keys.
	 * @return array
	 */
	protected function sanitize_keys( $keys ) {
		$sanitize_keys = array();

		foreach ( $keys as $key => $value ) {
			/**
			 * Some field providers concatenate child fields with pipes for complex field.
			 * We only want to return the base meta key.
			 */
			$key_parts             = explode( '|', $value );
			$sanitize_keys[ $key ] = $key_parts[0];
		}

		$sanitize_keys = array_values( array_unique( $sanitize_keys ) );

		return $sanitize_keys;
	}
}
