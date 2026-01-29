<?php
/**
 * PostMeta Controller
 *
 * @package ZIORWebDev\WordPressBlocks\Controllers
 */

namespace ZIORWebDev\WordPressBlocks\Controllers;

use ZIORWebDev\WordPressBlocks\Utils;

/**
 * PostMeta Controller class
 *
 * @package ZIORWebDev\WordPressBlocks\Controllers;
 * @since 1.0.0
 */
class PostMeta extends Base {

	/**
	 * Get post meta value.
	 */
	public static function get_value( $params ): mixed {
		$meta_key = isset( $params['metaKey'] ) ? $params['metaKey'] : '';
		$provider = isset( $params['fieldProvider'] ) ? $params['fieldProvider'] : '';
		$post_id  = self::get_post_id( $params );

		if ( empty( $post_id ) ) {
			return '';
		}

		$meta_value = get_post_meta( $post_id, $meta_key, true );

		/**
		 * If field provider is set, get the value by provider.
		 */
		$meta_value = apply_filters( "zior_wp_blocks_postmeta_provider_{$provider}_value", $meta_value, $post_id, $meta_key );

		/**
		 * Filter specific meta key.
		 */
		$meta_value = apply_filters( "zior_wp_blocks_postmeta_{$meta_key}_value", $meta_value, $post_id, $attributes );

		return $meta_value;
	}

	/**
	 * Determine post ID from parameters or global context.
	 *
	 * @param array $params parameters.
	 * @return int|null
	 */
	private static function get_post_id( $params ) {
		global $post;

		if ( isset( $params['postId'] ) && $params['postId'] ) {
			return (int) $params['postId'];
		}

		if ( isset( $post->ID ) ) {
			return (int) $post->ID;
		}

		$post_id = get_the_ID();

		return $post_id ? (int) $post_id : null;
	}

	/**
	 * Retrieve a list of WordPress option keys.
	 *
	 * @param string $path Cache path.
	 * @param array  $params Additional arguments.
	 *
	 * @return array List of option keys.
	 */
	public static function get_keys( string $path, array $params ): array {
		$cache_key   = static::get_cache_key( $path, $params );
		$cached_data = static::get_cache( $cache_key );

		if ( ! empty( $cached_data ) ) {
			return $cached_data;
		}

		global $wpdb;

		/**
		 * Filter the limit for option name results.
		 */
		$limit = absint( apply_filters( 'zior_wp_blocks_rest_query_limit', 50 ) );

		$search_term = $args['search'] ?? '';
		$post_type   = $args['post_type'] ?? 'page';

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
		$postmeta = Utils\Helper::sanitize_keys( $postmeta );

		// Set cache.
		static::set_cache( $cache_key, $postmeta );

		return $postmeta;
	}
}
