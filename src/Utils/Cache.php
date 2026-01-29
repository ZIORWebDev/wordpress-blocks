<?php
/**
 * Cache class
 *
 * @package ZIORWebDev\WordPressBlocks\Utils
 * @since 1.0.0
 */
namespace ZIORWebDev\WordPressBlocks\Utils;

use PinkCrab\WP_PSR16_Cache\File_Cache;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Cache class
 *
 * @package ZIORWebDev\WordPressBlocks\Utils
 * @since 1.0.0
 */
class Cache {

	/**
	 * Cache
	 *
	 * @var object
	 */
	protected static $cache;

	/**
	 * Get REST cache dir
	 *
	 * @since 1.0.0
	 * @return string
	 */
	protected static function get_rest_cache_dir() {
		$cache_dir = Utils\FileSystem::get_cache_dir();

		Utils\FileSystem::create_cache_dir( $cache_dir );
		Utils\FileSystem::secure_cache_dir( $cache_dir );

		return $cache_dir . '/rest/';
	}

	/**
	 * Get cache engine
	 *
	 * @since 1.0.0
	 * @return object
	 */
	public static function get_cache_engine() {
		if ( ! self::$cache ) {
			self::$cache = new File_Cache( self::get_rest_cache_dir() );
		}

		return self::$cache;
	}

	/**
	 * Get REST cache key
	 *
	 * @param array $args Arguments to build cache key.
	 * @since 1.0.0
	 * @return string
	 */
	public static function get_cache_key( string $path, array $args ): string {
		$path = str_replace( '/', '-', $path );

		// phpcs:ignore WordPress.PHP.DiscouragedPHPFunctions.serialize_serialize
		$serialized_args     = serialize( $args );
		$md5_serialized_args = md5( $serialized_args );
		$cache_key           = $path . '-' . $md5_serialized_args;

		return $cache_key;
	}
}
