<?php
/**
 * Carbon Fields class
 *
 * @package ZIORWebDev\WordPressBlocks
 * @since 1.0.0
 */
namespace ZIORWebDev\WordPressBlocks\Controllers;

/**
 * Carbon Fields Blocks
 *
 * @package ZIORWebDev\WordPressBlocks
 * @since 1.0.0
 */
class CarbonFields {

	/**
	 * Singleton instance of the Plugin class.
	 *
	 * @var CarbonFields
	 */
	protected static $instance;

	/**
	 * Class constructor.
	 */
	public function __construct() {
		add_filter( 'wordpress_blocks_meta_field_meta_keys', array( $this, 'filter_meta_keys' ), 10, 4 );
	}

	/**
	 * CabonFields save meta keys for complex fields in pipe delimited format.
	 * Only retrieve parent field for complex fields.
	 *
	 * @param array  $meta_keys Existing meta keys.
	 * @param string $type 'post_meta' or 'options'
	 * @param string $search Search term.
	 * @param string $post_type Post type.
	 * @return array
	 */
	public function filter_meta_keys( $meta_keys, $type, $search, $post_type ) {
		foreach ( $meta_keys as $key => $meta_key ) {
			if ( strpos( $meta_key, '|' ) !== false ) {
				$parts             = explode( '|', $meta_key );
				$meta_keys[ $key ] = trim( $parts[0] );
			}
		}

		return array_values( array_unique( $meta_keys, SORT_REGULAR ) );
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
