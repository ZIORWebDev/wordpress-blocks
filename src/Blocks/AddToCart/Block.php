<?php
/**
 * Server-side rendering of the `zior/icon` blocks.
 *
 * @package ZIORWebDev\WordPressBlocks
 */

namespace ZIORWebDev\WordPressBlocks\Blocks\AddToCart;

use ZIORWebDev\WordPressBlocks\Blocks;

/**
 * Add to Cart class
 *
 * @package ZIORWebDev\WordPressBlocks
 * @since 1.0.0
 */
class Block extends Blocks\Base {

	/**
	 * Block name
	 *
	 * @var $block_name
	 */
	protected $block_name = 'zior/add-to-cart';

	/**
	 * Path of the block.json file
	 *
	 * @var $block_json
	 */
	protected $block_json = __DIR__ . '/block.json';

	/**
	 * Renders the `zior/add-to-cart` block on server.
	 *
	 * @since 1.0.0
	 * @param Array    $attributes The block attributes.
	 * @param String   $content    InnerBlocks content of the Block.
	 * @param WP_Block $block      Block object.
	 * @return string Rendered HTML of the referenced block.
	 */
	public function render( $attributes, $content, $block ) {
		/**
		 * If this is not a single product, return the $content.
		 */
		if ( ! is_singular( 'product' ) ) {
			return $content;
		}

		/**
		 * If the product Id is set, return the $content.
		 */
		if ( ! empty( $attributes['productId'] ?? '' ) ) {
			return $content;
		}

		$product_id = get_queried_object_id();

		if ( ! $product_id ) {
			return $content;
		}

		$content = preg_replace(
			'/\bdata-product-id=""/',
			'data-product-id="' . esc_attr( $product_id ) . '"',
			$content,
			1
		);

		return $content;
	}
}
