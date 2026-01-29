<?php
/**
 * Options Hook
 *
 * @package ZIORWebDev\WordPressBlocks\Hooks
 */

namespace ZIORWebDev\WordPressBlocks\Hooks;

/**
 * Options hook class
 *
 * @package ZIORWebDev\WordPressBlocks\Hooks;
 * @since 1.0.0
 */
class Options {

	/**
	 * Singleton instance.
	 *
	 * @var Options
	 */
	protected static $instance;

	/**
	 * Constructor.
	 */
	public function __construct() {
		/**
		 * Filters to get meta/option values based on field providers.
		 */
		add_filter( 'zior_wp_blocks_option_provider_acf_value', array( $this, 'get_acf_option_value' ), 10, 2 );
		add_filter( 'zior_wp_blocks_option_provider_carbon_field_value', array( $this, 'get_carbon_field_option_value' ), 10, 2 );
		add_filter( 'zior_wp_blocks_option_provider_metabox_value', array( $this, 'get_metabox_option_value' ), 10, 2 );
		add_filter( 'zior_wp_blocks_option_provider_pods_value', array( $this, 'get_pods_option_value' ), 10, 2 );
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
