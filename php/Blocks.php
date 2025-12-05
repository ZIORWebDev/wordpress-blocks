<?php
/**
 * Blocks class
 *
 * @package ZiorWebDev\WordPressBlocks
 * @since 1.0.0
 */
namespace ZiorWebDev\WordPressBlocks;

use ZiorWebDev\WordPressBlocks\Integration;
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
		return apply_filters( 'ziorwebdev_wordpress_blocks_routes', array() );
	}

	/**
	 * Class constructor.
	 * 
	 */
	public function __construct() {
		Blocks\Icon\Block::get_instance();
		Blocks\MetaField\Block::get_instance();
		Controllers\CarbonFields::get_instance();

		add_filter( 'render_block_context', array( $this, 'inject_parent_context' ), 10, 3 );
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
	 * Inject parent icon-picker attributes into child icon context.
	 *
	 * @param array $context      The current block context.
	 * @param array $parsed_block The parsed block array.
	 * @param object $parent_block The parent block object.
	 *
	 * @return array Modified block context.
	 */
	public function inject_parent_context( $context, $parsed_block, $parent_block ) {
		// Only apply to the child block.
		if ( ! isset( $parsed_block['blockName'] ) || 'ziorwebdev/icon' !== $parsed_block['blockName'] ) {
			return $context;
		}

		// Ensure parent exists and is icon-picker.
		if ( ! isset( $parent_block->parsed_block['blockName'] ) 
			|| 'ziorwebdev/icon-picker' !== $parent_block->parsed_block['blockName'] ) {
			return $context;
		}

		$parent_attrs = $parent_block->parsed_block['attrs'] ?? [];

		// Pass parent attributes into child context.
		foreach ( [ 'iconColorValue', 'iconBackgroundColorValue', 'showLabels', 'size' ] as $key ) {
			if ( isset( $parent_attrs[ $key ] ) ) {
				$context[ $key ] = $parent_attrs[ $key ];
			}
		}

		return $context;
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
