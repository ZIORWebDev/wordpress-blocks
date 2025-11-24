<?php
/**
 * Load class
 *
 * @package ZiorWebDev\WordPressBlocks
 * @since 1.0.0
 */
namespace ZiorWebDev\WordPressBlocks;

/**
 * Include the Composer autoload file if you're not using Composer in your package.
 *
 */

/**
 * Blocks
 */
use ZiorWebDev\WordPressBlocks\Controllers\IconPicker;

/**
 * Class Load
 *
 * @package ZiorWebDev\WordPressBlocks
 * @since 1.0.0
 */
final class Load {

	/**
	 * Singleton instance of the Plugin class.
	 *
	 * @var Load
	 */
	protected static $instance;

	/**
	 * Class constructor.
	 * 
	 */
	public function __construct() {

		Controllers\IconPicker::get_instance();
	}

	/**
	 * Enqueue blocks script
	 * 
	 * @return void
	 */
	public function enqueue_blocks_script() {
		if ( ! is_admin() ) {
			return;
		}

		// Determine dependency
		$screen       = get_current_screen();
		$dependencies = array( 'wp-blocks', 'wp-dom-ready' );

		if ( $screen->base === 'post' ) {
			$dependencies[] = 'wp-edit-post';
		} elseif ( $screen->base === 'widgets' ) {
			$dependencies[] = 'wp-edit-widgets';
		}

		// Enqueue editor JS
		wp_enqueue_script(
			'localbusiness-schema-pro-editor',
			LOCALBUSINESS_SCHEMA_PRO_PLUGIN_URL . 'dist/blocks/editor.min.js',
			$dependencies,
			null
		);

		// Enqueue editor CSS
		wp_enqueue_style(
			'localbusiness-schema-pro-editor',
			LOCALBUSINESS_SCHEMA_PRO_PLUGIN_URL . 'dist/blocks/editor.min.css',
			array(), // dependencies
			null
		);
	}
}
