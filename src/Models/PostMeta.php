<?php
/**
 * PostMeta Model
 *
 * @package ZIORWebDev\WordPressBlocks\Models
 */

namespace ZIORWebDev\WordPressBlocks\Models;

use ZIORWebDev\WordPressBlocks\Utils\Cache;

/**
 * PostMeta Model class
 *
 * @package ZIORWebDev\WordPressBlocks\Models;
 * @since 1.0.0
 */
class PostMeta extends Models\Base {
	/**
	 * Retrieve a list of WordPress option keys.
	 *
	 * @param string $path Cache path.
	 * @param array  $args Additional arguments.
	 *
	 * @return array List of option keys.
	 */
	public function get_postmeta_keys( string $path, array $args ): array {
		$cached_key  = $this->get_cache_key( $path, $args );
		$cached_data = $this->get_cache( $cache_key );

		if ( false !== $cached_data ) {
			return $cached_data;
		}

		global $wpdb;

		/**
		 * Filter the limit for option name results.
		 */
		$limit = absint( apply_filters( 'wordpress_blocks_rest_query_limit', 50 ) );

		// Search term.
		$search_term = $args['search'] ?: '';

		// Get meta keys for the given post type
		$query = $wpdb->prepare(
			"SELECT DISTINCT pm.meta_key
				FROM {$wpdb->postmeta} pm
				INNER JOIN {$wpdb->posts} p ON p.ID = pm.post_id
				WHERE p.post_type = %s
				AND pm.meta_key NOT LIKE '\_wp%%'
				AND pm.meta_key LIKE %s
				ORDER BY pm.meta_key ASC
				LIMIT {$limit}",
			$post_type,
			'%' . $wpdb->esc_like( $search_term ) . '%'
		);

		$postmeta = $wpdb->get_col( $query );
		$postmeta = $this->sanitize_keys( $postmeta );

		// Set cache.
		$this->set_cache( $cache_key, $postmeta );

		return $postmeta;
	}
}
