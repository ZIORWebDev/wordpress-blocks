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
	 * Load blocks.
	 */
	public function load() {
		Blocks\Icon\Block::get_instance();
		Blocks\IconPicker\Block::get_instance();
		Blocks\IconListItem\Block::get_instance();
		Blocks\IconList\Block::get_instance();
		Blocks\MetaField\Block::get_instance();
		Blocks\AddToCart\Block::get_instance();
	}
}
