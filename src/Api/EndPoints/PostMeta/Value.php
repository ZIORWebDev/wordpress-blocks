<?php
/**
 * PostMeta Value endpoint
 *
 * @package ZIORWebDev\WordPressBlocks\Api\Endpoints\PostMeta
 * @since 1.0.0
 */
namespace ZIORWebDev\WordPressBlocks\Api\Endpoints\PostMeta;

use ZIORWebDev\WordPressBlocks\Utils;
use ZIORWebDev\WordPressBlocks\Api\EndPoints;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * PostMeta Value endpoint
 *
 * @package ZIORWebDev\WordPressBlocks\Api\Endpoints\PostMeta
 * @since 1.0.0
 */
class Value extends EndPoints\Base {

	/**
	 * Route path
	 *
	 * @var string
	 */
	protected static $route_path = 'postmeta/value';

	/**
	 * Callback
	 *
	 * @param \WP_REST_Request $request The request.
	 * @return array The response.
	 */
	public static function callback( \WP_REST_Request $request ) {
		$meta_value = self::get_postmeta_value( $request->get_params() );
		$meta_value = Utils\Helper::normalize_value( $meta_value );

		return rest_ensure_response( array( 'value' => $meta_value ) );
	}

	/**
	 * Get meta/option value based on attributes.
	 *
	 * @param array $attributes Block attributes.
	 * @return mixed
	 */
	private static function get_postmeta_value( $attributes ) {
		$meta_key   = isset( $attributes['metaKey'] ) ? $attributes['metaKey'] : '';
		$provider   = isset( $attributes['fieldProvider'] ) ? $attributes['fieldProvider'] : '';
		$post_id    = self::get_post_id( $attributes );

		if ( empty( $post_id ) ) {
			return '';
		}

		$meta_value = get_post_meta( $post_id, $meta_key, true );

		/**
		 * If field provider is set, get the value by provider.
		 */
		$meta_value = apply_filters( "wordpress_blocks_postmeta_provider_{$provider}_value", $meta_value, $post_id, $meta_key );

		/**
		 * Filter specific meta key.
		 */
		$meta_value = apply_filters( "wordpress_blocks_postmeta_{$meta_key}_value", $meta_value, $post_id, $attributes );

		return $meta_value;
	}

	/**
	 * Determine post ID from attributes or global context.
	 *
	 * @param array $attributes Block attributes.
	 * @return int|null
	 */
	private static function get_post_id( $attributes ) {
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
		return array(
			'metaKey' => array(
				'type'              => 'string',
				'required'          => true,
				'sanitize_callback' => 'sanitize_text_field',
			),
			'postId' => array(
				'type'              => 'integer',
				'required'          => true,
				'sanitize_callback' => 'absint',
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
