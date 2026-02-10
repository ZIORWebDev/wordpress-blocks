<?php
/**
 * Helper class
 *
 * @package ZIORWebDev\WordPressBlocks\Utils
 * @since 1.0.0
 */
namespace ZIORWebDev\WordPressBlocks\Utils;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Helper class
 *
 * @package ZIORWebDev\WordPressBlocks\Utils
 * @since 1.0.0
 */
class Helper {

	/**
	 * Normalize arrays/objects to strings.
	 *
	 * @param mixed $value Value to normalize.
	 * @return string|null
	 */
	public static function normalize_value( $value ) {
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
	 * Sanitize keys.
	 *
	 * @param array $keys keys.
	 * @return array
	 */
	public static function sanitize_keys( $keys ) {
		$sanitize_keys = array();

		foreach ( $keys as $key => $value ) {
			/**
			 * Some field providers concatenate child fields with pipes for complex field.
			 * We only want to return the base meta key.
			 */
			$key_parts             = explode( '|', $value );
			$sanitize_keys[ $key ] = $key_parts[0];
		}

		$sanitize_keys = array_values( array_unique( $sanitize_keys ) );

		return $sanitize_keys;
	}
}
