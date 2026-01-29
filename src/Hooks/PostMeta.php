<?php
/**
 * PostMeta Hooks
 *
 * @package ZIORWebDev\WordPressBlocks\Hooks
 */

namespace ZIORWebDev\WordPressBlocks\Hooks;

/**
 * PostMeta hook class
 *
 * @package ZIORWebDev\WordPressBlocks\Hooks;
 * @since 1.0.0
 */
class PostMeta {

	/**
	 * Singleton instance.
	 *
	 * @var PostMeta
	 */
	protected static $instance;

	/**
	 * Constructor.
	 */
	public function __construct() {
		/**
		 * Filters to get post meta values based on field providers.
		 */
		add_filter( 'zior_wp_blocks_postmeta_provider_acf_value', array( $this, 'get_acf_post_meta_value' ), 10, 3 );
		add_filter( 'zior_wp_blocks_postmeta_provider_carbon_field_value', array( $this, 'get_carbon_field_post_meta_value' ), 10, 3 );
		add_filter( 'zior_wp_blocks_postmeta_provider_metabox_value', array( $this, 'get_metabox_post_meta_value' ), 10, 3 );
		add_filter( 'zior_wp_blocks_postmeta_provider_pods_value', array( $this, 'get_pods_post_meta_value' ), 10, 3 );
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
