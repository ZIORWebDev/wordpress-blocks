<?php
/**
 * WordPress BLocks Hooks
 *
 * @package ZIORWebDev\WordPressBlocks\Hooks
 */

namespace ZIORWebDev\WordPressBlocks\Hooks;

/**
 * Meta Field class
 *
 * @package ZIORWebDev\WordPressBlocks\Hooks;
 * @since 1.0.0
 */
class Meta {

	/**
	 * Singleton instance.
	 *
	 * @var Meta
	 */
	protected static $instance;

	/**
	 * Constructor.
	 */
	public function __construct() {
		/**
		 * Filters to get meta/option values based on field providers.
		 */
		add_filter( 'wordpress_blocks_meta_field_option_acf_value', array( $this, 'get_acf_option_value' ), 10, 2 );
		add_filter( 'wordpress_blocks_meta_field_option_carbon_field_value', array( $this, 'get_carbon_field_option_value' ), 10, 2 );
		add_filter( 'wordpress_blocks_meta_field_option_metabox_value', array( $this, 'get_metabox_option_value' ), 10, 2 );
		add_filter( 'wordpress_blocks_meta_field_option_pods_value', array( $this, 'get_pods_option_value' ), 10, 2 );

		/**
		 * Filters to get post meta values based on field providers.
		 */
		add_filter( 'wordpress_blocks_meta_field_post_meta_acf_value', array( $this, 'get_acf_post_meta_value' ), 10, 3 );
		add_filter( 'wordpress_blocks_meta_field_post_meta_carbon_field_value', array( $this, 'get_carbon_field_post_meta_value' ), 10, 3 );
		add_filter( 'wordpress_blocks_meta_field_post_meta_metabox_value', array( $this, 'get_metabox_post_meta_value' ), 10, 3 );
		add_filter( 'wordpress_blocks_meta_field_post_meta_pods_value', array( $this, 'get_pods_post_meta_value' ), 10, 3 );
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
	 * Get post meta using the configured provider.
	 *
	 * @param string $provider Provider identifier.
	 * @param int    $post_id  Post ID.
	 * @param string $meta_key Meta key.
	 * @return mixed
	 */
	private function get_post_meta_by_provider( $provider, $post_id, $meta_key ) {
		$default_value = get_post_meta( $post_id, $meta_key, true );
		$meta_value    = apply_filters( "wordpress_blocks_meta_field_post_meta_{$provider}_value", $default_value, $post_id, $meta_key );

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
		$meta_value    = apply_filters( "wordpress_blocks_meta_field_option_{$provider}_value", $default_value, $meta_key );

		return $meta_value;
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
