<?php
/**
 * WordPressBlocks Settings Page
 *
 * @package ZIORWebDev\WordPressBlocks
 */

namespace ZIORWebDev\WordPressBlocks\Admin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Settings class.
 */
class Settings {

	/**
	 * Admin slug.
	 */
	private const PAGE_SLUG = 'simpliblocks';

	/**
	 * Initialize hooks.
	 *
	 * @return void
	 */
	public static function init(): void {
		add_action( 'admin_menu', array( __CLASS__, 'add_menu_page' ) );
		add_action( 'admin_init', array( __CLASS__, 'register_settings' ) );
	}

	/**
	 * Add Tools submenu page.
	 *
	 * @return void
	 */
	public static function add_menu_page(): void {
		add_options_page(
			__( 'SimpliBlocks', 'zior-wordpress-blocks' ), // Page title
			__( 'SimpliBlocks', 'zior-wordpress-blocks' ), // Menu title
			'manage_options',                            // Capability
			self::PAGE_SLUG,                             // Menu slug
			array( __CLASS__, 'render_page' )            // Callback
		);
	}

	/**
	 * Register settings.
	 *
	 * @return void
	 */
	public static function register_settings(): void {
		register_setting(
			'simpliblocks_settings_group',
			'simpliblocks_settings'
		);
	}

	/**
	 * Render settings page.
	 *
	 * @return void
	 */
	public static function render_page(): void {
		load_template(
			dirname( __DIR__ ) . '../../templates/settings.php',
			false,
			array(
				'title'        => __( 'SimpliBlocks', 'zior-wordpress-blocks' ),
				'description'  => __(
					'SimpliBlocks saves REST API query results as cache files to improve performance. Clearing the cache files will delete all stored REST query cache files and force fresh queries on the next request.',
					'zior-wordpress-blocks'
				),
				'button_label' => __( 'Reset Cache File', 'zior-wordpress-blocks' ),
			)
		);
	}
}
