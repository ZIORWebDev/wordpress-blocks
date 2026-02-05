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
	 * Initialize action and filter hooks.
	 */
	public function init() {
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
}
