<?php
/**
 * Server-side rendering of the `zior/icon-list` blocks.
 *
 * @package ZIORWebDev\WordPressBlocks
 */

namespace ZIORWebDev\WordPressBlocks\Blocks\IconList;

use ZIORWebDev\WordPressBlocks\Blocks;

/**
 * Icon Picker class
 *
 * @package ZIORWebDev\WordPressBlocks
 * @since 1.0.0
 */
class Block extends Blocks\Base {

	/**
	 * Block name
	 */
	protected $block_name = 'zior/icon-list';

	/**
	 * Path of the block.json file
	 */
	protected $block_json = __DIR__ . '/block.json';

	/**
	 * Renders the `zior/icon-list` block on server.
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
		return $content;
	}
}
