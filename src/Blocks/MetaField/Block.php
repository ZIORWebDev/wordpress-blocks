<?php
/**
 * Server-side rendering of the `zior/meta-field` blocks.
 *
 * @package ZIORWebDev\WordPressBlocks
 */

namespace ZIORWebDev\WordPressBlocks\Blocks\MetaField;

use ZIORWebDev\WordPressBlocks\Blocks;
use ZIORWebDev\WordPressBlocks\utils;

/**
 * Meta Field class
 *
 * @package ZIORWebDev\WordPressBlocks
 * @since 1.0.0
 */
class Block extends Blocks\Base {

	/**
	 * Block name
	 */
	protected $block_name = 'zior/meta-field';

	/**
	 * Path of the block.json file
	 */
	protected $block_json = __DIR__ . '/block.json';

	/**
	 * Renders the `zior/meta-field` block on server.
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
		$meta_key = $attributes['metaKey'] ?? '';
		$tag      = $attributes['tagName'] ?? 'h' . ( (int) ( $attributes['level'] ?? 2 ) );

		if ( empty( $meta_key ) ) {
			return $content;
		}

		$meta_value = $this->get_meta_value( $attributes );
		$meta_value = apply_filters( 'zior_wp_blocks_meta_field_value', $meta_value, $meta_key, $attributes );

		/**
		 * Return original content if value is empty.
		 */
		if ( empty( $meta_value ) ) {
			return $content;
		}

		$normalized_value = Utils\Helper::normalize_value( $meta_value );

		/**
		 * Sanitize value.
		 */
		if ( is_string( $normalized_value ) && strpos( $normalized_value, '<' ) !== false ) {
			$sanitized_value = wp_kses_post( $normalized_value );
		} else {
			$sanitized_value = esc_html( (string) $normalized_value );
		}

		/**
		 * Preserve the content formatting, classes, and styles but replace the content with meta value.
		 */
		return $this->replace_inner_html( $content, $sanitized_value );
	}

	/**
	 * Replace the deepest text node in the HTML with the given value.
	 *
	 * @param string $html Original HTML.
	 * @param string $value Value to replace.
	 * @return string Modified HTML.
	 */
	private function replace_inner_html( $html, $value ) {
		if ( empty( trim( $html ) ) ) {
			return $value;
		}

		$replaced = preg_replace(
			'~(<(?<tag>[a-z][a-z0-9:-]*)\b[^>]*>)([^<]*)(</\k<tag>>)~is',
			'$1' . $value . '$4',
			$html,
			1
		);

		return $replaced;
	}

	/**
	 * Get meta/option value based on attributes.
	 *
	 * @param array $attributes Block attributes.
	 * @return mixed
	 */
	private function get_meta_value( $attributes ) {
		$meta_key   = isset( $attributes['metaKey'] ) ? $attributes['metaKey'] : '';
		$type       = isset( $attributes['metaFieldType'] ) ? $attributes['metaFieldType'] : 'post_meta';
		$provider   = isset( $attributes['fieldProvider'] ) ? $attributes['fieldProvider'] : '';
		$meta_value = '';

		if ( 'post_meta' === $type ) {
			$post_id = $this->get_post_id( $attributes );

			if ( ! $post_id ) {
				return null;
			}

			$meta_value = $this->get_post_meta_by_provider( $provider, $post_id, $meta_key );
		} else {
			$meta_value = $this->get_option_by_provider( $provider, $meta_key );
		}

		/**
		 * Filter specific meta key.
		 */
		$meta_value = apply_filters( "zior_wp_blocks_meta_field_{$meta_key}_value", $meta_value, $attributes );

		return $meta_value;
	}

	/**
	 * Determine post ID from attributes or global context.
	 *
	 * @param array $attributes Block attributes.
	 * @return int|null
	 */
	private function get_post_id( $attributes ) {
		global $post;

		if ( isset( $attributes['postId'] ) && $attributes['postId'] ) {
			return (int) $attributes['postId'];
		}

		if ( isset( $post->ID ) ) {
			return (int) $post->ID;
		}

		$post_id = get_the_ID();

		return $post_id ? (int) $post_id : null;
	}

	/**
	 * Get post meta using the configured provider.
	 *
	 * @param string $provider Provider identifier.
	 * @param int    $post_id  Post ID.
	 * @param string $meta_key Meta key.
	 * @return mixed
	 */
	private function get_post_meta_by_provider( $provider, $post_id, $meta_key ) {
		$default_value = get_post_meta( $post_id, $meta_key, true );
		$meta_value    = apply_filters( "zior_wp_blocks_meta_field_post_meta_{$provider}_value", $default_value, $post_id, $meta_key );

		return $meta_value;
	}

	/**
	 * Get option value using the configured provider.
	 *
	 * @param string $provider Provider identifier.
	 * @param string $meta_key Option name.
	 * @return mixed
	 */
	private function get_option_by_provider( $provider, $meta_key ) {
		$default_value = get_option( $meta_key );
		$meta_value    = apply_filters( "zior_wp_blocks_meta_field_option_{$provider}_value", $default_value, $meta_key );

		return $meta_value;
	}
}
