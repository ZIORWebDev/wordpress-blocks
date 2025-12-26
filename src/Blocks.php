<?php
/**
 * Blocks class
 *
 * @package ZiorWebDev\WordPressBlocks
 * @since 1.0.0
 */
namespace ZiorWebDev\WordPressBlocks;

// use ZiorWebDev\WordPressBlocks\Integration;
/**
 * Class Blocks
 *
 * @package ZiorWebDev\WordPressBlocks
 * @since 1.0.0
 */
final class Blocks {

	/**
	 * Singleton instance of the Plugin class.
	 *
	 * @var Blocks
	 */
	protected static $instance;

	/**
	 * Get REST API routes.
	 *
	 * @return array
	 */
	private function get_routes() {
		return apply_filters( 'wordpress_blocks_routes', array() );
	}

	/**
	 * Class constructor.
	 */
	public function __construct() {
		Blocks\Icon\Block::get_instance();
		Blocks\IconPicker\Block::get_instance();
		Blocks\IconListItem\Block::get_instance();
		Blocks\IconList\Block::get_instance();
		Blocks\MetaField\Block::get_instance();

		add_action( 'rest_api_init', array( $this, 'register_routes' ), 10 );
	}

	/**
	 * Register REST API routes.
	 *
	 * @return void
	 */
	public function register_routes() {
		$routes = $this->get_routes();

		if ( empty( $routes ) || ! is_array( $routes ) ) {
			return;
		}

		foreach ( $routes as $route ) {
			register_rest_route(
				$route['namespace'],
				$route['route'],
				$route['args']
			);
		}
	}

	/**
	 * Returns instance of Settings.
	 *
	 * @since 1.0.0
	 * @return object
	 */
	public static function get_instance() {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}

		return self::$instance;
	}
}
