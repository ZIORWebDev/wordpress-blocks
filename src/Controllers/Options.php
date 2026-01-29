<?php
/**
 * Options Controller
 *
 * @package ZIORWebDev\WordPressBlocks\Controllers
 */

namespace ZIORWebDev\WordPressBlocks\Controllers;

use ZIORWebDev\WordPressBlocks\Utils;

/**
 * Options Controller class
 *
 * @package ZIORWebDev\WordPressBlocks\Controllers;
 * @since 1.0.0
 */
class Options extends Base {
	/**
	 * Retrieve a option value.
	 *
	 * @param string $key Data key to retrieve.
	 * @return mixed The resolved value, or null if the key does not exist.
	 */
	public static function get_value( array $params ): mixed {
		$meta_key   = isset( $params['metaKey'] ) ? $params['metaKey'] : '';
		$provider   = isset( $params['fieldProvider'] ) ? $params['fieldProvider'] : '';
		$meta_value = get_option( $meta_key );

		/**
		 * If field provider is set, get the value by provider.
		 */
		$meta_value = apply_filters( "zior_wp_blocks_option_provider_{$provider}_value", $meta_value, $meta_key );

		/**
		 * Filter specific meta key.
		 */
		$meta_value = apply_filters( "zior_wp_blocks_option_{$meta_key}_value", $meta_value, $params );

		return $meta_value;
	}

	/**
	 * Retrieve a list of WordPress option keys.
	 *
	 * @param string $path Cache path.
	 * @param array  $args Additional arguments.
	 *
	 * @return array List of option keys.
	 */
	public static function get_keys( string $path, array $args ): array {
		$cache_key   = static::get_cache_key( $path, $args );
		$cached_data = static::get_cache( $cache_key );

		if ( ! empty( $cached_data ) ) {
			return $cached_data;
		}

		global $wpdb;

		/**
		 * Exclude unnecessary option name patterns.
		 */
		$default_excludes = array(
			'_transient%',
			'_site_transient%',
			'_cron%',
			'_delete_on_update%',
			'_deprecated%',
			'%_api%',
		);

		/**
		 * Filter the list of excluded option name patterns.
		 */
		$excludes = apply_filters( 'zior_wp_blocks_rest_query_options_keys_excluded', $default_excludes );

		/**
		 * Filter the limit for option name results.
		 */
		$limit = absint( apply_filters( 'zior_wp_blocks_rest_query_limit', 50 ) );

		// Build NOT LIKE SQL conditions.
		$not_like_sql = array();

		foreach ( $excludes as $pattern ) {
			$not_like_sql[] = $wpdb->prepare( 'option_name NOT LIKE %s', $pattern );
		}

		$where = implode( ' AND ', $not_like_sql );

		// Add search filter.
		$search_term = $args['search'] ?? '';
		$search_like = '%' . $wpdb->esc_like( $search_term ) . '%';

		// Prepare the query.
		$query = $wpdb->prepare(
			"SELECT option_name
			FROM {$wpdb->options}
			WHERE {$where}
			AND option_name LIKE %s
			ORDER BY option_name ASC
			LIMIT {$limit}",
			$search_like
		);

		$options = $wpdb->get_col( $query );
		$options = Utils\Helper::sanitize_keys( $options );

		// Set cache.
		static::set_cache( $cache_key, $options );

		return $options;
	}
}
