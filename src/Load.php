<?php
/**
 * Load class
 *
 * @package ZIORWebDev\WordPressBlocks
 * @since 1.0.0
 */
namespace ZIORWebDev\WordPressBlocks;

/**
 * Class Load
 *
 * @package ZIORWebDev\WordPressBlocks
 * @since 1.0.0
 */
final class Load {

	/**
	 * Package version.
	 *
	 * @var string
	 */
	protected static $package_version = '1.1.4';

	/**
	 * Singleton instance of the Plugin class.
	 *
	 * @var Load
	 */
	protected static $instance;

	/**
	 * Class constructor.
	 */
	public function __construct() {
		add_action( 'enqueue_block_assets', array( $this, 'enqueue_block_assets' ), 50 );
		add_action( 'enqueue_block_editor_assets', array( $this, 'enqueue_editor_assets' ) );

		Routes::get_instance();
		Blocks::get_instance();
		Hooks\Options::get_instance();
		Hooks\PostMeta::get_instance();
	}

	/**
	 * Enqueue blocks script
	 *
	 * @return void
	 */
	public function enqueue_editor_assets() {
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

		$block_editor_js = plugin_dir_url( __DIR__ ) . 'dist/blocks/editor.min.js';

		// Enqueue editor JS
		wp_enqueue_script(
			'ziorwebdev-wordpress-blocks-editor',
			$block_editor_js,
			$dependencies,
			self::$package_version
		);

		$rest_namespace = Routes::get_namespace();

		wp_localize_script(
			'ziorwebdev-wordpress-blocks-editor',
			'ZIORWebDevWordPressBlocks',
			array(
				'restUrl' => esc_url( rest_url( $rest_namespace ) ),
				'nonce'   => wp_create_nonce( 'wp_rest' ),
			)
		);
	}

	/**
	 * Enqueue block assets
	 *
	 * @return void
	 */
	public function enqueue_block_assets() {
		$block_style_css  = plugin_dir_url( __DIR__ ) . 'dist/blocks/main.min.css';
		$block_editor_css = plugin_dir_url( __DIR__ ) . 'dist/blocks/editor.min.css';

		wp_enqueue_style( 'dashicons' );

		wp_enqueue_style(
			'ziorwebdev-wordpress-blocks-editor',
			$block_editor_css,
			array(), // dependencies
			self::$package_version
		);

		// Enqueue block CSS
		wp_enqueue_style(
			'ziorwebdev-wordpress-blocks-style',
			$block_style_css,
			array(), // dependencies
			self::$package_version
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
