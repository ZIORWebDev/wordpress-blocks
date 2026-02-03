<?php
/**
 * Routes library
 *
 * @package ZIORWebDev\WordPressBlocks
 * @since 1.0.0
 */
namespace ZIORWebDev\WordPressBlocks;

use ZIORWebDev\WordPressBlocks\Api\Endpoints;
use ZIORWebDev\WordPressBlocks\Api\Interface;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Routes library
 *
 * @package ZIORWebDev\WordPressBlocks\Api
 * @since 1.0.0
 */
class Routes {

	/**
	 * Routes
	 *
	 * @var array
	 */
	protected $routes = array();

	/**
	 * REST namespace
	 *
	 * @var string
	 */
	private static $rest_namespace = 'wordpress-blocks/v1';

	/**
	 * Load routes.
	 */
	public function load() {
		add_action( 'rest_api_init', array( $this, 'register_rest_api' ) );
	}

	/**
	 * Get REST namespace
	 *
	 * @return string The REST namespace.
	 */
	public static function get_namespace() {
		return self::$rest_namespace;
	}

	/**
	 * REST init
	 */
	public function register_rest_api() {
		new Endpoints\Products\Lists();
		new Endpoints\Options\Lists();
		new Endpoints\PostMeta\Lists();

		new Endpoints\Options\Value();
		new Endpoints\PostMeta\Value();
	}

	/**
	 * Get instance
	 *
	 * @return RoutesLibrary The instance.
	 */
	public static function get_instance() {
		if ( ! isset( self::$instance ) ) {
			self::$instance = new self();
		}
		return self::$instance;
	}
}
