<?php
/**
 * Cache class
 *
 * @package ZIORWebDev\WordPressBlocks\Traits
 * @since 1.0.0
 */
namespace ZIORWebDev\WordPressBlocks\Traits;

use ZIORWebDev\WordPressBlocks\Utils\Cache as CacheUtils;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Cache class
 *
 * @package ZIORWebDev\WordPressBlocks\Traits
 * @since 1.0.0
 */
trait Cache {
	/**
	 * Generate a cache key for a request.
	 *
	 * @param string $path REST route path.
	 * @param array  $args Request arguments used to scope the cache.
	 *
	 * @return string Generated cache key.
	 */
	public static function get_cache_key( string $path, array $args ): string {
		$cache_key = CacheUtils::get_cache_key( $path, $args );

		return $cache_key;
	}

	/**
	 * Retrieve a value from cache.
	 *
	 * @param string $cache_key Cache key identifier.
	 * @return mixed Cached value, or false/null if not found.
	 */
	public static function get_cache( string $cache_key ): mixed {
		$cache       = CacheUtils::get_cache_engine();
		$cached_data = $cache->get( $cache_key );

		return $cached_data;
	}

	/**
	 * Store a value in cache.
	 *
	 * @param string $cache_key Cache key identifier.
	 * @param mixed  $value     Value to cache.
	 *
	 * @return void
	 */
	public static function set_cache( string $cache_key, mixed $value ): void {
		$cache = CacheUtils::get_cache_engine();
		$cache->set( $cache_key, $value, 1 * HOUR_IN_SECONDS );
	}
}
