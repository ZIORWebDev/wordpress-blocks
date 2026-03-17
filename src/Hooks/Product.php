<?php
/**
 * Product Hook
 *
 * @package ZIORWebDev\WordPressBlocks\Hooks
 */

namespace ZIORWebDev\WordPressBlocks\Hooks;

/**
 * Product hook class
 *
 * @package ZIORWebDev\WordPressBlocks\Hooks;
 * @since 1.0.0
 */
class Product {

	/**
	 * Initialize action and filter hooks.
	 */
	public function init() {
		add_filter( 'woocommerce_product_get_rating_html', array( $this, 'get_product_get_rating_html' ), 10, 3 );
	}

	/**
	 * Append rating fraction (e.g. 4.0/5) next to WooCommerce star rating HTML.
	 *
	 * @param string $html   Existing rating HTML.
	 * @param float  $rating Product average rating.
	 * @param int    $count  Number of reviews.
	 *
	 * @return string Modified rating HTML.
	 */
	public function get_product_get_rating_html( $html, $rating, $count ) {
		$rating = (float) $rating;

		if ( $rating <= 0 ) {
			return $html;
		}

		$rating_rounded = round( $rating, 1 );
		$rating_text    = number_format( $rating_rounded, 1 );

		// WooCommerce max rating is 5, so we can hardcode it here. If WooCommerce ever changes this in the future, we can update it then.
		$rating_fraction = sprintf(
			' <strong class="zior-product-rating-fraction" aria-hidden="true">%s/5</strong>',
			esc_html( $rating_text )
		);

		$html = sprintf(
			'%s%s',
			$rating_fraction,
			$html,
		);

		return $html;
	}
}
