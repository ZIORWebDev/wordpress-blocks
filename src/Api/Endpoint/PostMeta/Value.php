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
use ZIORWebDev\WordPressBlocks\Controllers\PostMeta as PostMetaController;

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
	protected $route_path = 'post_meta/value';

	/**
	 * Callback
	 *
	 * @param \WP_REST_Request $request The request.
	 * @return array The response.
	 */
	public function callback( \WP_REST_Request $request ) {
		$meta_value = PostMetaController::get_value( $request->get_params() );
		$meta_value = Utils\Helper::normalize_value( $meta_value );

		return rest_ensure_response( array( 'value' => $meta_value ) );
	}

	/**
	 * Get REST args
	 *
	 * @return array The REST args.
	 */
	public function get_rest_args() {
		return array(
			'metaKey'       => array(
				'type'              => 'string',
				'required'          => true,
				'sanitize_callback' => 'sanitize_text_field',
			),
			'postId'        => array(
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
	public function get_rest_method() {
		return \WP_REST_Server::READABLE;
	}
}
