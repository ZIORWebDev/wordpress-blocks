<?php
/**
 * Options List endpoint
 *
 * @package ZIORWebDev\WordPressBlocks\Api\Endpoints\Options
 * @since 1.0.0
 */
namespace ZIORWebDev\WordPressBlocks\Api\Endpoints\Options;

use ZIORWebDev\WordPressBlocks\Api\EndPoints;
use ZIORWebDev\WordPressBlocks\Controllers\Options as OptionsController;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Options List endpoint
 *
 * @package ZIORWebDev\WordPressBlocks\Api\Endpoints\Options
 * @since 1.0.0
 */
class Lists extends EndPoints\Base {

	/**
	 * Route path
	 *
	 * @var string
	 */
	protected $route_path = 'options/lists';

	/**
	 * Callback
	 *
	 * @param \WP_REST_Request $request The request.
	 * @return array The response.
	 */
	public function callback( \WP_REST_Request $request ) {
		$path    = $this->get_rest_path();
		$params  = $request->get_params();
		$options = OptionsController::get_keys( $path, $params );

		return rest_ensure_response(
			array(
				'meta_keys' => $options,
			)
		);
	}

	/**
	 * Get REST permission
	 *
	 * @since 1.0.0
	 * @return boolean|\WP_Error
	 */
	public function get_rest_permission( \WP_REST_Request $request ) {
		/**
		 * For security reasons, only return the list of options keys when
		 * the logged in user is an administrator and nonce is valid.
		 */
		if ( $this->is_valid_nonce( $request ) && current_user_can( 'manage_options' ) ) {
			return true;
		}

		return new \WP_Error( 'rest_forbidden', __( 'Permission denied.' ), array( 'status' => 403 ) );
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
