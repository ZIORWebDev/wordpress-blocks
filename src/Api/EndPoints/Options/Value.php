<?php
/**
 * Options Value endpoint
 *
 * @package ZIORWebDev\WordPressBlocks\Api\Endpoints\Options
 * @since 1.0.0
 */
namespace ZIORWebDev\WordPressBlocks\Api\Endpoints\Options;

use ZIORWebDev\WordPressBlocks\utils;
use ZIORWebDev\WordPressBlocks\Api\EndPoints;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Options Value endpoint
 *
 * @package ZIORWebDev\WordPressBlocks\Api\Endpoints\Options
 * @since 1.0.0
 */
class Value extends EndPoints\Base {

	/**
	 * Route path
	 *
	 * @var string
	 */
	protected static $route_path = 'options/value';

	/**
	 * Callback
	 *
	 * @param \WP_REST_Request $request The request.
	 * @return array The response.
	 */
	public static function callback( \WP_REST_Request $request ) {
		$meta_value = self::get_option_value( $request->get_params() );
		$meta_value = Utils\Helper::normalize_value( $meta_value );

		return rest_ensure_response( array( 'value' => $meta_value ) );
	}

	/**
	 * Get meta/option value based on attributes.
	 *
	 * @param array $attributes Block attributes.
	 * @return mixed
	 */
	private static function get_option_value( $attributes ) {
		$meta_key   = isset( $attributes['metaKey'] ) ? $attributes['metaKey'] : '';
		$provider   = isset( $attributes['fieldProvider'] ) ? $attributes['fieldProvider'] : '';
		$meta_value = get_option( $meta_key );

		/**
		 * If field provider is set, get the value by provider.
		 */
		$meta_value = apply_filters( "wordpress_blocks_option_provider_{$provider}_value", $meta_value, $meta_key );

		/**
		 * Filter specific meta key.
		 */
		$meta_value = apply_filters( "wordpress_blocks_option_{$meta_key}_value", $meta_value, $attributes );

		return $meta_value;
	}

	/**
	 * Get REST args
	 *
	 * @return array The REST args.
	 */
	public static function get_rest_args() {
		return array(
			'metaKey' => array(
				'type'              => 'string',
				'required'          => true,
				'sanitize_callback' => 'sanitize_text_field',
			),
			'fieldProvider' => array(
				'type'              => 'string',
				'required'          => false,
				'sanitize_callback' => 'sanitize_text_field',
			),
		);
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
