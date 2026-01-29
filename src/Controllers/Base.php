<?php
/**
 * Base Controller
 *
 * @package ZIORWebDev\WordPressBlocks\Controllers
 */

namespace ZIORWebDev\WordPressBlocks\Controllers;

use ZIORWebDev\WordPressBlocks\Utils\Cache;

/**
 * Base class
 *
 * @package ZIORWebDev\WordPressBlocks\Controllers;
 * @since 1.0.0
 */
abstract class Base {
	/**
	 * Generate a cache key for a request.
	 *
	 * @param string $path REST route path.
	 * @param array  $args Request arguments used to scope the cache.
	 *
	 * @return string Generated cache key.
	 */
	public static function get_cache_key( string $path, array $args ): string {
		$cache_key = Cache::get_cache_key( $path, $args );

		return $cache_key;
	}

	/**
	 * Retrieve a value from cache.
	 *
	 * @param string $cache_key Cache key identifier.
	 * @return mixed Cached value, or false/null if not found.
	 */
	public static function get_cache( string $cache_key ): mixed {
		$cache       = Cache::get_cache_engine();
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
		$cache = Cache::get_cache_engine();
		$cache->set( $cache_key, $value, 1 * HOUR_IN_SECONDS );
	}
}
