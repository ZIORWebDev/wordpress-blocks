<?php
/**
 * PostMeta Lists endpoint
 *
 * @package ZIORWebDev\WordPressBlocks\Api\Endpoints\PostMeta
 * @since 1.0.0
 */
namespace ZIORWebDev\WordPressBlocks\Api\Endpoints\PostMeta;

use ZIORWebDev\WordPressBlocks\Api\EndPoints;
use ZIORWebDev\WordPressBlocks\Controllers\PostMeta as PostMetaController;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * PostMeta Lists endpoint
 *
 * @package ZIORWebDev\WordPressBlocks\Api\Endpoints\PostMeta
 * @since 1.0.0
 */
class Lists extends EndPoints\Base {

	/**
	 * Route path
	 *
	 * @var string
	 */
	protected $route_path = 'post_meta/lists';

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
					'meta_keys' => $cached_data,
				)
			);
		}

		$postmeta = PostMetaController::get_keys( $params );

		/**
		 * Save cache.
		 */
		static::set_cache( $cache_key, $options );

		return rest_ensure_response(
			array(
				'meta_keys' => $postmeta,
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
			'search' => array(
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
	public function get_rest_method() {
		return \WP_REST_Server::READABLE;
	}
}
