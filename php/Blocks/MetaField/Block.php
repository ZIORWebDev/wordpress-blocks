<?php
/**
 * Server-side rendering of the `ziorwebdev/meta-field` blocks.
 *
 * @package ZiorWebDev\WordPressBlocks
 */

namespace ZiorWebDev\WordPressBlocks\Blocks\MetaField;

use ZiorWebDev\WordPressBlocks\Blocks;

/**
 * Meta Field class
 *
 * @package ZiorWebDev\WordPressBlocks
 * @since 1.0.0
 */
class Block extends Blocks\Base {

	/**
	 * Block name
	 */
	protected $block_name = 'ziorwebdev/meta-field';

	/**
	 * Path of the block.json file
	 */
	protected $block_json = __DIR__ . '/block.json';

	/**
	 * Singleton instance.
	 *
	 * @var MetaField
	 */
	protected static $instance;

	/**
	 * Get option name by field ID.
	 *
	 * @param string $field_id Field ID.
	 * @return string|null
	 */
	private function get_option_name_by_field_name( $field_id ) {
		$meta_boxes = apply_filters( 'rwmb_meta_boxes', array() );

		foreach ( $meta_boxes as $meta_box ) {
			if ( empty( $meta_box['option_name'] ) ) {
				continue;
			}

			foreach ( $meta_box['fields'] as $field ) {
				if ( $field['id'] === $field_id ) {
					return $meta_box['option_name'];
				}
			}
		}

		return null;
	}

	/**
	 * Get pod name by field name.
	 *
	 * @param string $field_name Field name.
	 * @return string|null
	 */
	private function get_pod_name_by_field_name( $field_name ) {
		$pods = pods_api()->load_pods();

		foreach ( $pods as $name => $pod_def ) {
			$pod = pods( $name );

			if ( array_key_exists( $field_name, $pod->fields() ) ) {
				return $name;
			}
		}

		return null;
	}

	/**
	 * Sanitize meta keys.
	 *
	 * @param array $meta_keys Meta keys.
	 * @return array
	 */
	private function sanitize_meta_keys( $meta_keys ) {
		$sanitize_meta_keys = array();

		foreach ( $meta_keys as $key => $meta_key ) {
			/**
			 * Some field providers concatenate child fields with pipes for complex field.
			 * We only want to return the base meta key.
			 */
			$meta_key_parts             = explode( '|', $meta_key );
			$sanitize_meta_keys[ $key ] = $meta_key_parts[0];
		}

		$sanitize_meta_keys = array_values( array_unique( $sanitize_meta_keys ) );

		return $sanitize_meta_keys;
	}

	/**
	 * Replace the deepest text node in the HTML with the given value.
	 *
	 * @param string $html Original HTML.
	 * @param string $value Value to replace.
	 * @return string Modified HTML.
	 */
	private function replace_text_node( $html, $value ) {
		if ( trim( $html ) === '' ) {
			return $html;
		}

		return preg_replace_callback(
			'/>([^<>]+)</',
			function ( $matches ) use ( $value ) {
				return '>' . $value . '<';
			},
			$html
		);
	}

	/**
	 * Get meta keys for post meta.
	 *
	 * @param string $search Search term.
	 * @param string $post_type Post type.
	 * @return array
	 */
	public function get_post_meta_keys( $meta_keys, $type, $search, $post_type ) {
		global $wpdb;

		/**
		 * Filter the limit for option name results.
		 */
		$limit = absint( apply_filters( 'ziorwebdev_wordpress_blocks_meta_field_limit', 15 ) );

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
			'%' . $wpdb->esc_like( $search ) . '%'
		);

		$meta_keys = $wpdb->get_col( $query );
		$meta_keys = $this->sanitize_meta_keys( $meta_keys );

		return $meta_keys;
	}

	/**
	 * Get meta keys for options.
	 *
	 * @param string $search Search term.
	 * @return array
	 */
	public function get_option_meta_keys( $meta_keys, $type, $search = '', $post_type = '' ) {
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
		);

		/**
		 * Filter the list of excluded option name patterns.
		 */
		$excludes = apply_filters( 'ziorwebdev_wordpress_blocks_meta_field_keys_excluded', $default_excludes );

		/**
		 * Filter the limit for option name results.
		 */
		$limit = absint( apply_filters( 'ziorwebdev_wordpress_blocks_meta_field_limit', 15 ) );

		// Build NOT LIKE SQL conditions
		$not_like_sql = array();

		foreach ( $excludes as $pattern ) {
			$not_like_sql[] = $wpdb->prepare( 'option_name NOT LIKE %s', $pattern );
		}

		$where = implode( ' AND ', $not_like_sql );

		// Add search filter
		$search_like = '%' . $wpdb->esc_like( $search ) . '%';

		// Prepare the query
		$query = $wpdb->prepare(
			"SELECT option_name
			FROM {$wpdb->options}
			WHERE {$where}
			AND option_name LIKE %s
			ORDER BY option_name ASC
			LIMIT {$limit}",
			$search_like
		);

		$meta_keys = $wpdb->get_col( $query );
		$meta_keys = $this->sanitize_meta_keys( $meta_keys );

		return $meta_keys;
	}

	/**
	 * Constructor.
	 */
	public function __construct() {
		parent::__construct();

		add_filter( 'ziorwebdev_wordpress_blocks_routes', array( $this, 'add_routes' ) );
		add_filter( 'ziorwebdev_wordpress_blocks_meta_field_post_meta_keys', array( $this, 'get_post_meta_keys' ), 10, 4 );
		add_filter( 'ziorwebdev_wordpress_blocks_meta_field_options_keys', array( $this, 'get_option_meta_keys' ), 10, 4 );

		/**
		 * Filters to get meta/option values based on field providers.
		 */
		add_filter( 'ziorwebdev_wordpress_blocks_meta_field_option_acf_value', array( $this, 'get_acf_option_value' ), 10, 2 );
		add_filter( 'ziorwebdev_wordpress_blocks_meta_field_option_carbon_field_value', array( $this, 'get_carbon_field_option_value' ), 10, 2 );
		add_filter( 'ziorwebdev_wordpress_blocks_meta_field_option_metabox_value', array( $this, 'get_metabox_option_value' ), 10, 2 );
		add_filter( 'ziorwebdev_wordpress_blocks_meta_field_option_pods_value', array( $this, 'get_pods_option_value' ), 10, 2 );

		/**
		 * Filters to get post meta values based on field providers.
		 */
		add_filter( 'ziorwebdev_wordpress_blocks_meta_field_post_meta_acf_value', array( $this, 'get_acf_post_meta_value' ), 10, 3 );
		add_filter( 'ziorwebdev_wordpress_blocks_meta_field_post_meta_carbon_field_value', array( $this, 'get_carbon_field_post_meta_value' ), 10, 3 );
		add_filter( 'ziorwebdev_wordpress_blocks_meta_field_post_meta_metabox_value', array( $this, 'get_metabox_post_meta_value' ), 10, 3 );
		add_filter( 'ziorwebdev_wordpress_blocks_meta_field_post_meta_pods_value', array( $this, 'get_pods_post_meta_value' ), 10, 3 );
	}

	/**
	 * Get ACF option value.
	 *
	 * @param mixed  $option_value Default option value.
	 * @param string $meta_key Meta key.
	 * @return mixed
	 */
	public function get_acf_option_value( $option_value, $meta_key ) {
		/**
		 * If ACF is not active, return the default value.
		 */
		if ( ! function_exists( 'get_field' ) ) {
			return $option_value;
		}

		/**
		 * Fetch the option value from ACF.
		 */
		$option_value = get_field( $meta_key, 'option' );

		return $option_value ?? '';
	}

	/**
	 * Get carbon field option value.
	 *
	 * @param mixed  $option_value Default option value.
	 * @param string $meta_key Meta key.
	 * @return mixed
	 */
	public function get_carbon_field_option_value( $option_value, $meta_key ) {
		/**
		 * If carbon fields is not active, return the default value.
		 */
		if ( ! function_exists( 'carbon_get_theme_option' ) ) {
			return $option_value;
		}

		/**
		 * Carbon field automatically adds an underscore prefix to the meta key.
		 * We need to remove it before fetching the value.
		 */
		$sanitize_meta_key = ltrim( $meta_key, '_' );

		/**
		 * Fetch the option value from Carbon Fields.
		 */
		$option_value = carbon_get_theme_option( $sanitize_meta_key );

		return $option_value;
	}

	/**
	 * Get metabox option value.
	 *
	 * @param mixed  $option_value Default option value.
	 * @param string $meta_key Meta key.
	 * @return mixed
	 */
	public function get_metabox_option_value( $option_value, $meta_key ) {
		/**
		 * If metabox is not active, return the default value.
		 */
		if ( ! function_exists( 'rwmb_meta' ) ) {
			return $option_value;
		}

		$option_name = $this->get_option_name_by_field_name( $meta_key );

		/**
		 * If option name is not found, return the default value.
		 */
		if ( empty( $option_name ) ) {
			return $option_value;
		}

		$option_value = rwmb_meta( $meta_key, array(), $option_name );

		return $option_value;
	}

	/**
	 * Get pods option value.
	 *
	 * @param mixed  $option_value Default option value.
	 * @param string $meta_key Meta key.
	 * @return mixed
	 */
	public function get_pods_option_value( $option_value, $meta_key ) {
		/**
		 * If pods is not active, return the default value.
		 */
		if ( ! function_exists( 'pods' ) ) {
			return $option_value;
		}

		$pod_name = $this->get_pod_name_by_field_name( $meta_key );

		/**
		 * If pod name is not found, return the default value.
		 */
		if ( empty( $pod_name ) ) {
			return $option_value;
		}

		$pods         = pods( $pod_name );
		$option_value = $pods->field( $meta_key );

		return $option_value;
	}

	/**
	 * Get ACF postmeta value.
	 *
	 * @param mixed  $option_value Default option value.
	 * @param string $meta_key Meta key.
	 * @return mixed
	 */
	public function get_acf_post_meta_value( $meta_value, $post_id, $meta_key ) {
		/**
		 * If ACF is not active, return the default value.
		 */
		if ( ! function_exists( 'get_field' ) ) {
			return $meta_value;
		}

		/**
		 * Fetch the option value from ACF.
		 */
		$meta_value = get_field( $meta_key, $post_id );

		return $meta_value ?? '';
	}

	/**
	 * Get carbon field postmeta value.
	 *
	 * @param mixed  $meta_value Default option value.
	 * @param string $meta_key Meta key.
	 * @return mixed
	 */
	public function get_carbon_field_post_meta_value( $meta_value, $post_id, $meta_key ) {
		/**
		 * If carbon fields is not active, return the default value.
		 */
		if ( ! function_exists( 'carbon_get_post_meta' ) ) {
			return $meta_value;
		}

		/**
		 * Carbon field automatically adds an underscore prefix to the meta key.
		 * We need to remove it before fetching the value.
		 */
		$sanitize_meta_key = ltrim( $meta_key, '_' );

		/**
		 * Fetch the option value from Carbon Fields.
		 */
		$meta_value = carbon_get_post_meta( $post_id, $sanitize_meta_key );

		return $meta_value;
	}

	/**
	 * Get metabox postmeta value.
	 *
	 * @param mixed  $meta_value Default option value.
	 * @param string $meta_key Meta key.
	 * @return mixed
	 */
	public function get_metabox_post_meta_value( $meta_value, $post_id, $meta_key ) {
		/**
		 * If metabox is not active, return the default value.
		 */
		if ( ! function_exists( 'rwmb_meta' ) ) {
			return $meta_value;
		}

		$meta_value = rwmb_meta( $meta_key, array(), $post_id );

		return $meta_value;
	}

	/**
	 * Get pods postmeta value.
	 *
	 * @param mixed  $meta_value Default option value.
	 * @param string $meta_key Meta key.
	 * @return mixed
	 */
	public function get_pods_post_meta_value( $meta_value, $post_id, $meta_key ) {
		/**
		 * If pods is not active, return the default value.
		 */
		if ( ! function_exists( 'pods' ) ) {
			return $meta_value;
		}

		$pods       = pods( get_post_type( $post_id ), $post_id );
		$meta_value = $pods->field( $meta_key );

		return $meta_value;
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
				'permission_callback' => array( $this, 'get_permission' ),
			),
		);

		$routes[] = array(
			'namespace' => 'wordpress-blocks/v1',
			'route'     => '/meta-value',
			'args'      => array(
				'methods'             => 'GET',
				'callback'            => array( $this, 'get_meta_value_callback' ),
				'permission_callback' => array( $this, 'get_permission' ),
			),
		);

		return $routes;
	}

	/**
	 * Get meta value callback for REST API.
	 *
	 * @param \WP_REST_Request $request The REST request.
	 * @return mixed
	 */
	public function get_meta_value_callback( $request ) {
		$meta_key      = $request->get_param( 'key' ) ?: '';
		$type          = $request->get_param( 'type' ) ?: '';
		$provider      = $request->get_param( 'provider' ) ?: '';
		$post_id       = $request->get_param( 'post_id' ) ?: '';
		$return_format = $request->get_param( 'return_format' ) ?: '';
		$data_index	   = $request->get_param( 'index' ) ?: 0;

		if ( empty( $meta_key ) ) {
			return rest_ensure_response( array( 'value' => '' ) );
		}

		$args = array(
			'metaKey'       => $meta_key,
			'metaFieldType' => $type,
			'fieldProvider' => $provider,
			'postId'        => $post_id,
			'returnFormat'  => $return_format,
			'dataIndex'     => $data_index,
		);

		$meta_value = $this->get_meta_value( $args );
		$meta_value = $this->normalize_value( $meta_value );

		return rest_ensure_response( array( 'value' => $meta_value ) );
	}

	/**
	 * Get meta keys.
	 *
	 * @return array
	 */
	public function get_meta_keys( $request ) {
		$type      = $request->get_param( 'type' ) ?: 'post_meta';
		$search    = $request->get_param( 'search' ) ?: '';
		$post_type = $request->get_param( 'post_type' ) ?: 'page';
		$meta_keys = apply_filters(
			"ziorwebdev_wordpress_blocks_meta_field_{$type}_keys",
			array(),
			$type,
			$search,
			$post_type
		);

		return rest_ensure_response( $meta_keys );
	}

	/**
	 * Renders the `ziorwebdev/meta-field` block on server.
	 *
	 * @since 1.0.0
	 *
	 * @param Array    $attributes The block attributes.
	 * @param String   $content    InnerBlocks content of the Block.
	 * @param WP_Block $block      Block object.
	 *
	 * @return string Rendered HTML of the referenced block.
	 */
	public function render( $attributes, $content, $block ) {
		$meta_key = $attributes['metaKey'] ?? '';
		$tag      = $attributes['tagName'] ?? 'h' . ( (int) ( $attributes['level'] ?? 2 ) );

		if ( empty( $meta_key ) ) {
			return $content;
		}

		$meta_value = $this->get_meta_value( $attributes );
		$meta_value = apply_filters( 'ziorwebdev_wordpress_blocks_meta_field_value', $meta_value, $meta_key, $attributes );

		/**
		 * Return original content if value is empty.
		 */
		if ( empty( $meta_value ) ) {
			return $content;
		}

		$normalized_value = $this->normalize_value( $meta_value );

		/**
		 * Sanitize value.
		 */
		if ( is_string( $normalized_value ) && strpos( $normalized_value, '<' ) !== false ) {
			$sanitized_value = wp_kses_post( $normalized_value );
		} else {
			$sanitized_value = esc_html( (string) $normalized_value );
		}

		/**
		 * Preserve the content formatting, classes, and styles but replace the content with meta value.
		 */
		return $this->replace_text_node( $content, $sanitized_value );
	}

	/**
	 * Get meta/option value based on attributes.
	 *
	 * @param array $attributes Block attributes.
	 * @return mixed
	 */
	private function get_meta_value( $attributes ) {
		$meta_key   = isset( $attributes['metaKey'] ) ? $attributes['metaKey'] : '';
		$type       = isset( $attributes['metaFieldType'] ) ? $attributes['metaFieldType'] : 'post_meta';
		$provider   = isset( $attributes['fieldProvider'] ) ? $attributes['fieldProvider'] : '';
		$meta_value = '';

		if ( 'post_meta' === $type ) {
			$post_id = $this->get_post_id( $attributes );

			if ( ! $post_id ) {
				return null;
			}

			$meta_value = $this->get_post_meta_by_provider( $provider, $post_id, $meta_key );
		} else {
			$meta_value = $this->get_option_by_provider( $provider, $meta_key );
		}

		/**
		 * Filter specific meta key.
		 */
		$meta_value = apply_filters( "ziorwebdev_wordpress_blocks_meta_field_{$meta_key}_value", $meta_value, $attributes );

		return $meta_value;
	}

	/**
	 * Determine post ID from attributes or global context.
	 *
	 * @param array $attributes Block attributes.
	 * @return int|null
	 */
	private function get_post_id( $attributes ) {
		global $post;

		if ( isset( $attributes['postId'] ) && $attributes['postId'] ) {
			return (int) $attributes['postId'];
		}

		if ( isset( $post->ID ) ) {
			return (int) $post->ID;
		}

		$post_id = get_the_ID();

		return $post_id ? (int) $post_id : null;
	}

	/**
	 * Get post meta using the configured provider.
	 *
	 * @param string $provider Provider identifier.
	 * @param int    $post_id  Post ID.
	 * @param string $meta_key Meta key.
	 * @return mixed
	 */
	private function get_post_meta_by_provider( $provider, $post_id, $meta_key ) {
		$default_value = get_post_meta( $post_id, $meta_key, true );
		$meta_value    = apply_filters( "ziorwebdev_wordpress_blocks_meta_field_post_meta_{$provider}_value", $default_value, $post_id, $meta_key );

		return $meta_value;
	}

	/**
	 * Get option value using the configured provider.
	 *
	 * @param string $provider Provider identifier.
	 * @param string $meta_key Option name.
	 * @return mixed
	 */
	private function get_option_by_provider( $provider, $meta_key ) {
		$default_value = get_option( $meta_key );
		$meta_value    = apply_filters( "ziorwebdev_wordpress_blocks_meta_field_option_{$provider}_value", $default_value, $meta_key );

		return $meta_value;
	}

	/**
	 * Normalize arrays/objects to strings.
	 *
	 * @param mixed $value Value to normalize.
	 * @return string|null
	 */
	private function normalize_value( $value ) {
		if ( is_array( $value ) ) {
			$all_scalar = true;

			foreach ( $value as $v ) {
				if ( ! is_scalar( $v ) ) {
					$all_scalar = false;
					break;
				}
			}

			if ( $all_scalar ) {
				return implode( ', ', $value );
			}

			/**
			 * When the value is nested array, return empty string as we cannot render it.
			 */
			return '';
		}

		/**
		 * When the value is object, return empty string as we cannot render it.
		 */
		if ( is_object( $value ) ) {
			return '';
		}

		return $value;
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
