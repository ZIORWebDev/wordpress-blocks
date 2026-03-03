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
	public function init() {
		add_action( 'enqueue_block_assets', array( $this, 'enqueue_block_assets' ), 50 );
		add_action( 'enqueue_block_editor_assets', array( $this, 'enqueue_editor_assets' ) );
		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_admin_scripts' ) );

		( new Routes() )->load();
		( new Blocks() )->load();
		( new Hooks\Options() )->init();
		( new Hooks\PostMeta() )->init();
		( new Hooks\Editor() )->init();
		( new Admin\Settings() )->init();
	}

	/**
	 * Enqueue admin scripts
	 *
	 * @param string $hook The current admin page hook.
	 * @return void
	 */
	public function enqueue_admin_scripts( string $hook ): void {
		if ( 'settings_page_simpliblocks' !== $hook ) {
			return;
		}

		$admin_js = plugin_dir_url( __DIR__ ) . 'dist/admin/admin.min.js';

		wp_enqueue_script(
			'zior-wp-blocks-admin',
			$admin_js,
			array(),
			self::$package_version,
			true
		);

		$rest_namespace = Routes::get_namespace();

		wp_localize_script(
			'zior-wp-blocks-admin',
			'ZIORWPBlocks',
			array(
				'restUrl'         => $rest_namespace,
				'hasSubscription' => apply_filters( 'zior_wp_blocks_has_subscription_support', false ),
				'isWCInstalled'   => apply_filters( 'zior_wp_blocks_is_woocommerce_installed', false ),
			)
		);
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

		// Enqueue WooCommerce styles in the block editor to preview blocks correctly.
		wp_enqueue_style( 'woocommerce-general' );

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
				'restUrl'         => $rest_namespace,
				'hasSubscription' => apply_filters( 'zior_wp_blocks_has_subscription_support', false ),
				'isWCInstalled'   => apply_filters( 'zior_wp_blocks_is_woocommerce_installed', false ),
			)
		);
	}

	/**
	 * Enqueue block assets
	 *
	 * @return void
	 */
	public function enqueue_block_assets() {
		$block_view_css   = plugin_dir_url( __DIR__ ) . 'dist/blocks/view.min.css';
		$block_editor_css = plugin_dir_url( __DIR__ ) . 'dist/blocks/editor.min.css';
		$block_view_js    = plugin_dir_url( __DIR__ ) . 'dist/blocks/view.min.js';

		wp_enqueue_style( 'dashicons' );
		wp_enqueue_style(
			'zior-wp-blocks-editor',
			$block_editor_css,
			array(),
			self::$package_version
		);

		// Enqueue block CSS
		wp_enqueue_style(
			'zior-wp-blocks-style',
			$block_view_css,
			array(),
			self::$package_version
		);

		wp_enqueue_script(
			'zior-wp-blocks-view',
			$block_view_js,
			array(),
			self::$package_version
		);
	}
}
