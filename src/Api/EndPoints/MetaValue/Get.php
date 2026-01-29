<?php
/**
 * Products endpoint
 *
 * @package ZIORWebDev\WordPressBlocks\Api\Endpoints\Products
 * @since 1.0.0
 */
namespace ZIORWebDev\WordPressBlocks\Api\Endpoints\Products;

use ZIORWebDev\WordPressBlocks\Utils;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Products endpoint
 *
 * @package ZIORWebDev\WordPressBlocks\Api\Endpoints\Products
 * @since 1.0.0
 */
class Get extends Base {

	/**
	 * Route path
	 *
	 * @var string
	 */
	protected static $route_path = 'metavalue\get';

	/**
	 * Callback
	 *
	 * @param \WP_REST_Request $request The request.
	 * @return array The response.
	 */
	public static function callback( \WP_REST_Request $request ) {
		if ( empty( $request->get_param( 'metaKey' ) ) ) {
			return rest_ensure_response( array( 'value' => '' ) );
		}

		$meta_value = $this->get_meta_value( $request->get_params() );
		$meta_value = Utils\Helper::normalize_value( $meta_value );

		return rest_ensure_response( array( 'value' => $meta_value ) );
	}

	/**
	 * Get meta/option value based on attributes.
	 *
	 * @param array $attributes Block attributes.
	 * @return mixed
	 */
	private function get_meta_value( $attributes ) {
		$meta_key   = isset( $attributes['metaKey'] ) ? $attributes['metaKey'] : '';
		$type       = isset( $attributes['metaFieldType'] ) ? $attributes['metaFieldType'] : 'post_meta';
		$provider   = isset( $attributes['fieldProvider'] ) ? $attributes['fieldProvider'] : '';
		$meta_value = '';

		if ( 'post_meta' === $type ) {
			$post_id = $this->get_post_id( $attributes );

			if ( ! $post_id ) {
				return null;
			}

			$meta_value = $this->get_post_meta_value_by_provider( $provider, $post_id, $meta_key );
		} else {
			$meta_value = $this->get_option_value_by_provider( $provider, $meta_key );
		}

		/**
		 * Filter specific meta key.
		 */
		$meta_value = apply_filters( "zior_wp_blocks_meta_field_{$meta_key}_value", $meta_value, $attributes );

		return $meta_value;
	}

	/**
	 * Get post meta using the configured provider.
	 *
	 * @param string $provider Provider identifier.
	 * @param int    $post_id  Post ID.
	 * @param string $meta_key Meta key.
	 * @return mixed
	 */
	private function get_post_meta_value_by_provider( $provider, $post_id, $meta_key ) {
		$default_value = get_post_meta( $post_id, $meta_key, true );
		$meta_value    = apply_filters( "zior_wp_blocks_meta_field_post_meta_{$provider}_value", $default_value, $post_id, $meta_key );

		return $meta_value;
	}

	/**
	 * Get option value using the configured provider.
	 *
	 * @param string $provider Provider identifier.
	 * @param string $meta_key Option name.
	 * @return mixed
	 */
	private function get_option_value_by_provider( $provider, $meta_key ) {
		$default_value = get_option( $meta_key );
		$meta_value    = apply_filters( "zior_wp_blocks_meta_field_option_{$provider}_value", $default_value, $meta_key );

		return $meta_value;
	}

	/**
	 * Determine post ID from attributes or global context.
	 *
	 * @param array $attributes Block attributes.
	 * @return int|null
	 */
	private function get_post_id( $attributes ) {
		global $post;

		if ( isset( $attributes['postId'] ) && $attributes['postId'] ) {
			return (int) $attributes['postId'];
		}

		if ( isset( $post->ID ) ) {
			return (int) $post->ID;
		}

		$post_id = get_the_ID();

		return $post_id ? (int) $post_id : null;
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
