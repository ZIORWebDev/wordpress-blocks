<?php
/**
 * Blocks class
 *
 * @package ZIORWebDev\WordPressBlocks
 * @since 1.0.0
 */
namespace ZIORWebDev\WordPressBlocks;

/**
 * Class Blocks
 *
 * @package ZIORWebDev\WordPressBlocks
 * @since 1.0.0
 */
class Blocks {

	/**
	 * Load blocks.
	 */
	public function load() {
		new Blocks\Icon\Block();
		new Blocks\IconPicker\Block();
		new Blocks\IconListItem\Block();
		new Blocks\IconList\Block();
		new Blocks\MetaField\Block();
		new Blocks\AddToCart\Block();
		new Blocks\ProductPrice\Block();
	}
}
