<?php
/**
 * Options List endpoint
 *
 * @package ZIORWebDev\WordPressBlocks\Api\Endpoints\Options
 * @since 1.0.0
 */
namespace ZIORWebDev\WordPressBlocks\Api\Endpoints\Options;

use ZIORWebDev\WordPressBlocks\Models\Options as OptionsModel;

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
class Lists extends Base {

	/**
	 * Route path
	 *
	 * @var string
	 */
	protected static $route_path = 'options\lists';

	/**
	 * Callback
	 *
	 * @param \WP_REST_Request $request The request.
	 * @return array The response.
	 */
	public static function callback( \WP_REST_Request $request ) {
		$path    = self::get_rest_path();
		$params  = $request->get_params();
		$model   = new OptionsModel();
		$options = $model->get_option_keys( $path, $params );

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
	public static function get_rest_permission( \WP_REST_Request $request ) {
		if ( self::is_valid_nonce( $request ) ) {
			return true;
		}

		/**
		 * For security reasons, only return the list of options keys when
		 * the logged in user is an administrator.
		 */
		if ( current_user_can( 'manage_options' ) ) {
			return true;
		}

		return new \WP_Error( 'rest_forbidden', __( 'Permission denied.' ), array( 'status' => 403 ) );
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
