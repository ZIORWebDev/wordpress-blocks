<?php
/**
 * Server-side rendering of the `ziorwebdev/icon-list` blocks.
 *
 * @package ZiorWebDev\WordPressBlocks
 */

namespace ZiorWebDev\WordPressBlocks\Blocks\IconList;

use ZiorWebDev\WordPressBlocks\Blocks;

/**
 * Icon Picker class
 *
 * @package ZiorWebDev\WordPressBlocks
 * @since 1.0.0
 */
class Block extends Blocks\Base {

	/**
	 * Block name
	 */
	protected $block_name = 'ziorwebdev/icon-list';

	/**
	 * Path of the block.json file
	 */
	protected $block_json = __DIR__ . '/block.json';

	/**
	 * Singleton instance of the Plugin class.
	 *
	 * @var Load
	 */
	protected static $instance;

	/**
	 * Renders the `ziorwebdev/icon-list` block on server.
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
