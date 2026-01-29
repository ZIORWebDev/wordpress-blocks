<?php
/**
 * Blocks class
 *
 * @package ZIORWebDev\WordPressBlocks
 * @since 1.0.0
 */
namespace ZIORWebDev\WordPressBlocks;

// use ZIORWebDev\WordPressBlocks\Integration;
/**
 * Class Blocks
 *
 * @package ZIORWebDev\WordPressBlocks
 * @since 1.0.0
 */
final class Blocks {

	/**
	 * Singleton instance of the Plugin class.
	 *
	 * @var Blocks
	 */
	protected static $instance;

	/**
	 * Class constructor.
	 */
	public function __construct() {
		Blocks\Icon\Block::get_instance();
		Blocks\IconPicker\Block::get_instance();
		Blocks\IconListItem\Block::get_instance();
		Blocks\IconList\Block::get_instance();
		Blocks\MetaField\Block::get_instance();
		Blocks\AddToCart\Block::get_instance();
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
