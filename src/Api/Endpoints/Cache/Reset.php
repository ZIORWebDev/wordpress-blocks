<?php
/**
 * Options List endpoint
 *
 * @package ZIORWebDev\WordPressBlocks\Api\Endpoints\Options
 * @since 1.0.0
 */
namespace ZIORWebDev\WordPressBlocks\Api\Endpoints\Cache;

use ZIORWebDev\WordPressBlocks\Api\Endpoints;
use ZIORWebDev\WordPressBlocks\Utils;

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
class Reset extends Endpoints\Base {

	/**
	 * Route path
	 *
	 * @var string
	 */
	protected $route_path = 'cache/reset';

	/**
	 * Callback
	 *
	 * @param \WP_REST_Request $request The request.
	 * @return array The response.
	 */
	public function callback( \WP_REST_Request $request ) {
		$response = array();

		try {
			Utils\FileSystem::delete_cache_dir();
			$response['success'] = true;
			$response['message'] = 'Cache cleared successfully.';

		} catch ( \Exception $e ) {
			$response['success'] = false;
			$response['message'] = $e->getMessage();
		}

		return rest_ensure_response( $response );
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

		return new \WP_Error( 'rest_forbidden', __( 'Permission denied.', 'zior-wordpress-blocks' ), array( 'status' => 403 ) );
	}

	/**
	 * Get REST args
	 *
	 * @return array The REST args.
	 */
	public function get_rest_args() {
		return array();
	}

	/**
	 * Get REST method
	 *
	 * @return string The REST method.
	 */
	public function get_rest_method() {
		return \WP_REST_Server::DELETABLE;
	}
}
