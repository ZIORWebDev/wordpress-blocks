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
	 * Singleton instance of the Plugin class.
	 *
	 * @var Icon
	 */
	protected static $instance;

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
		$product_id = isset( $attributes['productId'] ) ? intval( $attributes['productId'] ) : '';
	}

	/**
	 * Returns CSS styles for icon and icon background colors.
	 *
	 * @since 1.0.0
	 * @param array $context Block context passed to icon.
	 * @return string Inline CSS styles for link's icon and background colors.
	 */
	public function get_color_styles( $context ) {
		$styles = array();

		if ( array_key_exists( 'iconColorValue', $context ) ) {
			$styles[] = 'color:' . $context['iconColorValue'] . ';';
		}

		if ( array_key_exists( 'iconBackgroundColorValue', $context ) ) {
			$styles[] = 'background-color:' . $context['iconBackgroundColorValue'] . ';';
		}

		return implode( '', $styles );
	}

	/**
	 * Returns CSS classes for icon and icon background colors.
	 *
	 * @since 1.0.0
	 * @param array $context Block context passed to icon.
	 * @return string CSS classes for link's icon and background colors.
	 */
	public function get_color_classes( $context ) {
		$classes = array();

		if ( array_key_exists( 'iconColor', $context ) ) {
			$classes[] = 'has-' . $context['iconColor'] . '-color';
		}

		if ( array_key_exists( 'iconBackgroundColor', $context ) ) {
			$classes[] = 'has-' . $context['iconBackgroundColor'] . '-background-color';
		}

		return ' ' . implode( ' ', $classes );
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
