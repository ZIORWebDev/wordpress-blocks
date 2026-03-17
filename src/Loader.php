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
	protected static $package_version = '1.2.6';

	/**
	 * Load classes and actions
	 */
	public function init() {
		add_action( 'init', array( $this, 'register_block_assets' ) );
		add_action( 'enqueue_block_editor_assets', array( $this, 'enqueue_block_editor_assets' ), 20 );
		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_admin_scripts' ) );

		( new Routes() )->load();
		( new Blocks() )->load();
		( new Hooks\Options() )->init();
		( new Hooks\PostMeta() )->init();
		( new Hooks\Editor() )->init();
		( new Hooks\Product() )->init();
		( new Admin\Settings() )->init();
	}

	/**
	 * Enqueue block editor assets
	 *
	 * @return void
	 */
	public function enqueue_block_editor_assets() {
		wp_enqueue_style( 'woocommerce-general' );
	}

	/**
	 * Register block assets
	 *
	 * @return void
	 */
	public function register_block_assets() {
		// Register block editor styles.
		wp_register_style(
			'zior-wp-blocks-editor',
			plugin_dir_url( __DIR__ ) . 'dist/blocks/editor.min.css',
			array(),
			null
		);

		// Register block frontend styles.
		wp_register_style(
			'zior-wp-blocks-view',
			plugin_dir_url( __DIR__ ) . 'dist/blocks/view.min.css',
			array(),
			null
		);

		wp_register_script(
			'zior-wp-blocks-editor',
			plugin_dir_url( __DIR__ ) . 'dist/blocks/editor.min.js',
			array( 'wp-blocks' ),
			null,
			true
		);

		wp_register_script(
			'zior-wp-blocks-view',
			plugin_dir_url( __DIR__ ) . 'dist/blocks/view.min.js',
			array(),
			null,
			true
		);

		wp_localize_script(
			'zior-wp-blocks-editor',
			'ZIORWPBlocks',
			array(
				'restUrl'         => Routes::get_namespace(),
				'hasSubscription' => apply_filters( 'zior_wp_blocks_has_subscription_support', false ),
				'isWCInstalled'   => apply_filters( 'zior_wp_blocks_is_woocommerce_installed', false ),
			)
		);
	}

	/**
	 * Enqueue admin scripts
	 *
	 * @param string $hook The current admin page hook.
	 * @return void
	 */
	public function enqueue_admin_scripts( string $hook ): void {
		if ( 'tools_page_simpliblocks' !== $hook ) {
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

		wp_localize_script(
			'zior-wp-blocks-admin',
			'ZIORWPBlocks',
			array(
				'restUrl' => Routes::get_namespace()
			)
		);
	}
}
