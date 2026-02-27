<?php
/**
 * Server-side rendering of the `zior/icon` blocks.
 *
 * @package ZIORWebDev\WordPressBlocks
 */

namespace ZIORWebDev\WordPressBlocks\Blocks\ProductPrice;

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
	protected $block_name = 'zior/product-price';

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
		// Return the content when not on a single product page
		// and no `productId` is provided in the block attributes.
		if ( ! is_singular( 'product' ) && empty( $attributes['product']['id'] ?? '' ) ) {
			return $content;
		}

		// If `productId` is not provided, fall back to the current product ID.
		$product_id = $attributes['product']['id'] ?: get_queried_object_id();

		if ( ! $product_id ) {
			return $content;
		}

		$product = wc_get_product( $product_id );
		$price   = $product->get_price_html();
		$content = preg_replace(
			'~<span\b[^>]*\bdata-zior-placeholder-price(?:\s*=\s*(?:"[^"]*"|\'[^\']*\'|[^\s>]+))?\b[^>]*>\s*</span>~i',
			$price,
			$content,
			1
		);

		return $content;
	}
}
