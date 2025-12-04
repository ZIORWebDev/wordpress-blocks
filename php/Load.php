<?php
/**
 * Load class
 *
 * @package ZiorWebDev\WordPressBlocks
 * @since 1.0.0
 */
namespace ZiorWebDev\WordPressBlocks;

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
		add_action( 'enqueue_block_editor_assets', array( $this, 'enqueue_blocks_script' ) );
		add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_frontend_styles' ) );

		Blocks::get_instance();
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

		$vendor_js        = plugin_dir_url( dirname( __FILE__ ) ) . 'dist/vendors.min.js';
		$block_editor_js  = plugin_dir_url( dirname( __FILE__ ) ) . 'dist/blocks/editor.min.js';

		// Enqueue vendor JS
		wp_enqueue_script(
			'ziorwebdev-wordpress-blocks-vendor',
			$vendor_js,
			array(),
			null
		);

		// Enqueue editor JS
		wp_enqueue_script(
			'ziorwebdev-wordpress-blocks-editor',
			$block_editor_js,
			$dependencies,
			null
		);

		$block_style_css  = plugin_dir_url( dirname( __FILE__ ) ) . 'dist/blocks/main.min.css';
		$block_editor_css = plugin_dir_url( dirname( __FILE__ ) ) . 'dist/blocks/editor.min.css';

		wp_enqueue_style(
			'ziorwebdev-wordpress-blocks-editor',
			$block_editor_css,
			array(), // dependencies
			null
		);

		// Enqueue block CSS
		wp_enqueue_style(
			'ziorwebdev-wordpress-blocks-style',
			$block_style_css,
			array(), // dependencies
			null
		);
	}

	/**
	 * Enqueue blocks styles
	 * 
	 * @return void
	 */
	public function enqueue_frontend_styles() {
		$block_style_css  = plugin_dir_url( dirname( __FILE__ ) ) . 'dist/blocks/main.min.css';
		$block_editor_css = plugin_dir_url( dirname( __FILE__ ) ) . 'dist/blocks/editor.min.css';

		wp_enqueue_style(
			'ziorwebdev-wordpress-blocks-editor',
			$block_editor_css,
			array(), // dependencies
			null
		);

		// Enqueue block CSS
		wp_enqueue_style(
			'ziorwebdev-wordpress-blocks-style',
			$block_style_css,
			array(), // dependencies
			null
		);
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
