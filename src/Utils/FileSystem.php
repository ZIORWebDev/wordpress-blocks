<?php
/**
 * FileSystem class
 *
 * @package ZIORWebDev\WordPressBlocks\Utils
 * @since 1.0.0
 */
namespace ZIORWebDev\WordPressBlocks\Utils;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * FileSystem class
 *
 * @package ZIORWebDev\WordPressBlocks\Utils
 * @since 1.0.0
 */
class FileSystem {

	/**
	 * Delete plugin uploads dir
	 *
	 * @return void
	 * @since 1.0.0
	 */
	public static function delete_cache_dir() {
		if ( ! function_exists( 'WP_Filesystem' ) ) {
			require_once ABSPATH . 'wp-admin/includes/file.php';
			WP_Filesystem();
		}

		global $wp_filesystem;

		$cache_dir = self::get_cache_dir( false );

		$wp_filesystem->delete( $cache_dir, true );
	}

	/**
	 * Get plugin cache dir
	 *
	 * @param bool $create_if_not_exists
	 * @return string
	 * @since 1.0.0
	 */
	public static function get_cache_dir( $create_if_not_exists = true ) {
		$upload_dir = wp_upload_dir()['basedir'];
		$cache_dir  = $upload_dir . '/wordpress-blocks/cache/';

		if ( $create_if_not_exists && ! is_dir( $cache_dir ) ) {
			self::create_folder_path( $cache_dir );
		}

		return $cache_dir;
	}

	/**
	 * Create cache dir
	 *
	 * @param string $path
	 * @return string
	 * @since 1.0.0
	 */
	public static function clear_cache_dir( $path ) {
		if ( ! is_dir( $path ) ) {
			wp_mkdir_p( $path );

			return $path;
		}

		return $path;
	}

	/**
	 * Secure cache dir
	 *
	 * @param string $path
	 * @return string
	 * @since 1.0.0
	 */
	public static function secure_cache_dir( $path ) {
		global $wp_filesystem;

		/**
		 * WP_Filesystem() needs to be called before the file is created.
		 */
		if ( empty( $wp_filesystem ) ) {
			require_once ABSPATH . 'wp-admin/includes/file.php';
			WP_Filesystem();
		}

		$files = array(
			array(
				'file'    => 'index.php',
				'content' => array(
					'<?php',
					'// Silence is golden.',
				),
			),
			array(
				'file'    => '.htaccess',
				'content' => array(
					'Options -Indexes',
					'<ifModule mod_headers.c>',
					'   <Files *.*>',
					'       Header set Content-Disposition attachment',
					'   </Files>',
					'</IfModule>',
				),
			),
		);

		foreach ( $files as $file ) {
			if ( ! file_exists( trailingslashit( $path ) . $file['file'] ) ) {
					$content = implode( PHP_EOL, $file['content'] );
					$wp_filesystem->put_contents( trailingslashit( $path ) . $file['file'], $content );
			}
		}

		return $path;
	}
}
