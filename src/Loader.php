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
final class Loader {

	/**
	 * Package version.
	 *
	 * @var string
	 */
	protected static $package_version = '1.1.4';

	/**
	 * Load classes and actions
	 */
	public function load() {
		add_action( 'enqueue_block_assets', array( $this, 'enqueue_block_assets' ), 50 );
		add_action( 'enqueue_block_editor_assets', array( $this, 'enqueue_editor_assets' ) );

		( new Routes() )->load();
		( new Blocks() )->load();
		( new Hooks\Options() )->load();
		( new Hooks\PostMeta() )->load();
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
			'zior-wp-blocks-editor',
			$block_editor_js,
			$dependencies,
			self::$package_version
		);

		$rest_namespace = Routes::get_namespace();

		wp_localize_script(
			'zior-wp-blocks-editor',
			'ZIORWPBlocks',
			array(
				'restUrl' => $rest_namespace,
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
			'zior-wp-blocks-editor',
			$block_editor_css,
			array(), // dependencies
			self::$package_version
		);

		// Enqueue block CSS
		wp_enqueue_style(
			'zior-wp-blocks-style',
			$block_style_css,
			array(), // dependencies
			self::$package_version
		);
	}
}
