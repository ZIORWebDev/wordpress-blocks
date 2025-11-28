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
		add_filter( 'render_block_context', array( $this, 'inject_parent_context' ), 10, 3 );

		add_filter( 'render_block_context', function( $context, $parsed_block, $parent_block ) {
			// Only apply to your child block
			if ( $parsed_block['blockName'] !== 'ziorwebdev/icon' ) {
				return $context;
			}

			// Ensure parent exists and is icon-picker
			if ( isset( $parent_block->parsed_block['blockName'] ) 
				&& $parent_block->parsed_block['blockName'] === 'ziorwebdev/icon-picker' ) {

				$parent_attrs = $parent_block->parsed_block['attrs'] ?? [];

				// Pass parent attributes into child context
				foreach ( [
					'iconColorValue',
					'iconBackgroundColorValue',
					'showLabels',
					'size'
				] as $key ) {
					if ( isset( $parent_attrs[ $key ] ) ) {
						$context[ $key ] = $parent_attrs[ $key ];
					}
				}
			}

				return $context;
		}, 10, 3 );


		Blocks\Icon\Icon::get_instance();
		// Blocks\IconPicker\IconPicker::get_instance();
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
