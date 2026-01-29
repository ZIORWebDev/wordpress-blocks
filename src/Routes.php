<?php
/**
 * Routes library
 *
 * @package ZIORWebDev\WordPressBlocks\Api
 * @since 1.0.0
 */
namespace ZIORWebDev\WordPressBlocks\Api;

use ZIORWebDev\WordPressBlocks\Api\Endpoints\Route;

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
	 * Instance
	 *
	 * @var Routes
	 */
	protected static $instance;

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
	 * Constructor
	 */
	private function __construct() {
		add_action( 'rest_api_init', array( $this, '_rest_init' ) );
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
	 * Get routes
	 *
	 * @param string $route_path The route path.
	 * @return array The routes.
	 */
	public function get_routes( $route_path = null ) {
		if ( ! $route_path ) {
			return $this->routes;
		}
		if ( isset( $this->routes[ $route_path ] ) ) {
			return $this->routes[ $route_path ];
		}
	}

	/**
	 * Register route
	 *
	 * @param Route $instance The route instance.
	 */
	public function register( Route $instance ) {
		$this->routes[ $instance::get_name() ] = $instance;
	}

	/**
	 * REST init
	 */
	public function _rest_init() {
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
