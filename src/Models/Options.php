<?php
/**
 * Options Model
 *
 * @package ZIORWebDev\WordPressBlocks\Models
 */

namespace ZIORWebDev\WordPressBlocks\Models;

use ZIORWebDev\WordPressBlocks\Utils;

/**
 * Options Model class
 *
 * @package ZIORWebDev\WordPressBlocks\Models;
 * @since 1.0.0
 */
class Options extends Base {
	/**
	 * Retrieve a value by key.
	 *
	 * @param string $key Data key to retrieve.
	 * @return mixed The resolved value, or null if the key does not exist.
	 */
	public function get_value( string $key ): mixed {
	}

	/**
	 * Retrieve a list of WordPress option keys.
	 *
	 * @param string $path Cache path.
	 * @param array  $args Additional arguments.
	 *
	 * @return array List of option keys.
	 */
	public function get_option_keys( string $path, array $args ): array {
		$cache_key  = $this->get_cache_key( $path, $args );
		$cached_data = $this->get_cache( $cache_key );

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
		$excludes = apply_filters( 'wordpress_blocks_rest_query_options_keys_excluded', $default_excludes );

		/**
		 * Filter the limit for option name results.
		 */
		$limit = absint( apply_filters( 'wordpress_blocks_rest_query_limit', 50 ) );

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
		$this->set_cache( $cache_key, $options );

		return $options;
	}
}
