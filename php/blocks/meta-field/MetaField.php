<?php
/**
 * Server-side rendering of the `ziorwebdev/meta-field` blocks.
 *
 * @package ZiorWebDev\WordPressBlocks
 */

namespace ZiorWebDev\WordPressBlocks\Blocks\MetaField;

use ZiorWebDev\WordPressBlocks\Blocks;

/**
 * Icon Picker class
 *
 * @package ZiorWebDev\WordPressBlocks
 * @since 1.0.0
 */
class MetaField extends Blocks\BaseBlock {

	/**
	 * Block name
	 */
	protected $block_name = 'ziorwebdev/meta-field';

	/**
	 * Path of the block.json file
	 */
	protected $block_json = __DIR__ . '/block.json';

	/**
	 * Singleton instance of the Plugin class.
	 *
	 * @var MetaField
	 */
	protected static $instance;

	/**
	 * Get meta keys for post meta.
	 * 
	 * @param string $search Search term.
	 * @param string $post_type Post type.
	 * @return array
	 */
	private function get_meta_keys_post_meta( $search = '', $post_type = 'page' ) {
		global $wpdb;

		// Get meta keys for the given post type
		$query = $wpdb->prepare(
			"SELECT DISTINCT pm.meta_key
				FROM {$wpdb->postmeta} pm
				INNER JOIN {$wpdb->posts} p ON p.ID = pm.post_id
				WHERE p.post_type = %s
				AND pm.meta_key NOT LIKE '\_wp%%'
				AND pm.meta_key LIKE %s
				ORDER BY pm.meta_key ASC
				LIMIT 15",
			$post_type,
			'%' . $wpdb->esc_like( $search ) . '%'
		);

		$keys = $wpdb->get_col( $query );

		return $keys;
	}

	/**
	 * Get meta keys for options.
	 * 
	 * @param string $search Search term.
	 * @return array
	 */
	private function get_meta_keys_options( $search = '' ) {
		global $wpdb;

		// Default excluded patterns
		$default_excludes = array(
			'_transient%',
			'_site_transient%',
			'_cron%',
			'_delete_on_update%',
			'_deprecated%',
		);

		/**
		 * Filter the list of excluded option name patterns.
		 *
		 * Allows developers to add or remove patterns.
		 *
		 * @param array $default_excludes Array of SQL LIKE patterns to exclude.
		 */
		$excludes = apply_filters( 'ziorwebdev_wordpress_blocks_meta_field_keys_excluded', $default_excludes );

		/**
		 * Filter the limit for option name results.
		 */
		$limit = apply_filters( 'ziorwebdev_wordpress_blocks_meta_field_limit', 15 );

		// Build NOT LIKE SQL conditions
		$not_like_sql = array();

		foreach ( $excludes as $pattern ) {
			$not_like_sql[] = $wpdb->prepare( "option_name NOT LIKE %s", $pattern );
		}
	
		$not_like_sql = implode( ' AND ', $not_like_sql );

		// Add search filter
		$search_like = '%' . $wpdb->esc_like( $search ) . '%';

		// Prepare the query
		$query = $wpdb->prepare(
			"SELECT option_name
			FROM {$wpdb->options}
			WHERE {$not_like_sql}
			AND option_name LIKE %s
			ORDER BY option_name ASC
			LIMIT {$limit}",
			$search_like
		);

		return $wpdb->get_col( $query );
	}

	/**
	 * Constructor.
	 */
	public function __construct() {
		parent::__construct();

		add_filter( 'ziorwebdev_wordpress_blocks_routes', array( $this, 'add_routes' ) );
	}	

	/**
	 * Add REST API routes.
	 * 
	 * @param array $routes Existing routes.
	 * @return array
	 */
	public function add_routes( $routes ) {
		$routes[] = array(
			'namespace' => 'wordpress-blocks/v1',
			'route'     => '/meta-keys',
			'args'      => array(
				'methods'             => 'GET',
				'callback'            => array( $this, 'get_meta_keys' ),
				'permission_callback' => array( $this, 'set_permission' )
			)
		);

		return $routes;
	}

	/**
	 * Get meta keys.
	 * 
	 * @return array
	 */
	public function get_meta_keys( $request ) {
		$type      = $request->get_param('type'); // 'post_meta' or 'options'
		$search    = $request->get_param('search') ?: '';
		$post_type = $request->get_param('post_type') ?: 'page';
		$meta_keys = array();

		if ( $type === 'post_meta' ) {
			$meta_keys = $this->get_meta_keys_post_meta( $search, $post_type );
		}

		if ( $type === 'options' ) {
			$meta_keys = $this->get_meta_keys_options( $search );
		}

		return rest_ensure_response( $meta_keys );
	}

	/**
	 * Renders the `ziorwebdev/meta-field` block on server.
	 *
	 * @since 5.4.0
	 *
	 * @param Array    $attributes The block attributes.
	 * @param String   $content    InnerBlocks content of the Block.
	 * @param WP_Block $block      Block object.
	 *
	 * @return string Rendered HTML of the referenced block.
	 */
	public function render( $attributes, $content, $block ) {
		return $content;
	}

	/**
	 * Returns instance of Settings.
	 *
	 * @since 1.0.0
	 * @return object
	 */
	public static function get_instance() {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}

		return self::$instance;
	}
}
