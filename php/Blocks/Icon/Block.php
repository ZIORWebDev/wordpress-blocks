<?php
/**
 * Server-side rendering of the `ziorwebdev/icon` blocks.
 *
 * @package ZiorWebDev\WordPressBlocks
 */

namespace ZiorWebDev\WordPressBlocks\Blocks\Icon;

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
	 *
	 * @var $block_name
	 */
	protected $block_name = 'ziorwebdev/icon';

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
	 * Convert string to title case
	 *
	 * @param String $title
	 * @return string
	 */
	private function convert_title_case( string $title ): string {
		$title = preg_replace( '/[^a-zA-Z0-9]+/', ' ', $title );
		$title = trim( $title );
		$title = preg_replace( '/\s+/', ' ', $title );
		$title = ucwords( strtolower( $title ) );

		return $title;
	}

	/**
	 * Renders the `ziorwebdev/icon` block on server.
	 *
	 * @since 1.0.0
	 * @param Array    $attributes The block attributes.
	 * @param String   $content    InnerBlocks content of the Block.
	 * @param WP_Block $block      Block object.
	 * @return string Rendered HTML of the referenced block.
	 */
	public function render( $attributes, $content, $block ) {
		$open_in_new_tab = isset( $block->context['openInNewTab'] ) ? $block->context['openInNewTab'] : false;
		$text            = ! empty( $attributes['label'] ) ? trim( $attributes['label'] ) : '';
		$service         = isset( $attributes['service'] ) ? $attributes['service'] : 'Icon';
		$url             = isset( $block->context['iconUrl'] ) ? $block->context['iconUrl'] : false;
		$text            = $text ? $text : $this->get_name( $service );
		$rel             = isset( $attributes['rel'] ) ? $attributes['rel'] : '';
		$show_labels     = array_key_exists( 'showLabels', $block->context ) ? $block->context['showLabels'] : false;

		/**
		 * Prepend emails with `mailto:` if not set.
		 * The `is_email` returns false for emails with schema.
		 */
		if ( is_email( $url ) ) {
			$url = 'mailto:' . antispambot( $url );
		}

		/**
		 * Prepend URL with https:// if it doesn't appear to contain a scheme
		 * and it's not a relative link or a fragment.
		 */
		if ( ! empty( $url ) && ! parse_url( $url, PHP_URL_SCHEME ) && ! str_starts_with( $url, '//' ) && ! str_starts_with( $url, '#' ) ) {
			$url = 'https://' . $url;
		}

		$icon               = $this->get_icon( $service );
		$wrapper_attributes = get_block_wrapper_attributes(
			array(
				'class' => 'wp-ziorwebdev-icon wp-ziorwebdev-icon-' . $service . $this->get_color_classes( $block->context ),
				'style' => $this->get_color_styles( $block->context ),
			)
		);

		$content = '<span ' . $wrapper_attributes . '>';

		/**
		 * TODO: Fix the styling of the icon even without the achor tag.
		 */
		$content .= '<a ';

		if ( ! empty( $url ) ) {
			$content .= ' href="' . esc_url( $url ) . '"';
		}

		$content .= 'class="wp-block-ziorwebdev-icon-anchor">';
		$content .= $icon;
		$content .= '<span class="wp-block-ziorwebdev-icon-label' . ( $show_labels ? '' : ' screen-reader-text' ) . '">' . esc_html( $text ) . '</span>';
		$content .= '</a></span>';

		$processor = new \WP_HTML_Tag_Processor( $content );
		$processor->next_tag( 'a' );

		if ( $open_in_new_tab ) {
			$processor->set_attribute( 'rel', trim( $rel . ' noopener nofollow' ) );
			$processor->set_attribute( 'target', '_blank' );
		} elseif ( '' !== $rel ) {
			$processor->set_attribute( 'rel', trim( $rel ) );
		}

		$html = $processor->get_updated_html();

		return $html;
	}

	/**
	 * Returns the SVG for icon.
	 *
	 * @since 1.0.0
	 * @param string $service The service icon.
	 * @return string SVG Element for service icon.
	 */
	public function get_icon( $service ) {
		$services = block_core_social_link_services();
		$services = array_merge( $services, $this->get_icon_services() );

		if ( isset( $services[ $service ] ) && isset( $services[ $service ]['icon'] ) ) {
			return $services[ $service ]['icon'];
		}

		/**
		 * Fallback: return Dashicon markup if service icon does not exist
		 * Example: <span class="dashicons dashicons-share"></span>
		 */
		return sprintf(
			'<span class="dashicons dashicons-%s"></span>',
			esc_attr( $service )
		);
	}

	/**
	 * Returns the brand name for icon.
	 *
	 * @since 1.0.0
	 * @param string $service The service icon.
	 * @return string Brand label.
	 */
	public function get_name( $service ) {
		$services = block_core_social_link_services();
		$services = array_merge( $services, $this->get_icon_services() );

		if ( isset( $services[ $service ] ) && isset( $services[ $service ]['name'] ) ) {
			return $services[ $service ]['name'];
		}

		/**
		 * Convert the service to title case and return.
		 */
		return $this->convert_title_case( $service );
	}

	/**
	 * Returns the SVG for icon.
	 *
	 * @since 1.0.0
	 *
	 * @param string $service The service slug to extract data from.
	 * @param string $field The field ('name', 'icon', etc) to extract for a service.
	 *
	 * @return array|string
	 */
	public function get_icon_services( $service = '', $field = '' ) {
		$services_data = array(
			'upwork' => array(
				'name' => _x( 'Upwork', 'wordpress-blocks' ),
				'icon' => '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="#000"><Path d="M18.561 13.158c-1.102 0-2.135-.467-3.074-1.227l.228-1.076.008-.042c.207-1.143.849-3.06 2.839-3.06 1.492 0 2.703 1.212 2.703 2.703-.001 1.489-1.212 2.702-2.704 2.702zm0-8.14c-2.539 0-4.51 1.649-5.31 4.366-1.22-1.834-2.148-4.036-2.687-5.892H7.828v7.112c-.002 1.406-1.141 2.546-2.547 2.548-1.405-.002-2.543-1.143-2.545-2.548V3.492H0v7.112c0 2.914 2.37 5.303 5.281 5.303 2.913 0 5.283-2.389 5.283-5.303v-1.19c.529 1.107 1.182 2.229 1.974 3.221l-1.673 7.873h2.797l1.213-5.71c1.063.679 2.285 1.109 3.686 1.109 3 0 5.439-2.452 5.439-5.45 0-3-2.439-5.439-5.439-5.439z" /></svg>',
			),
		);

		/**
		 * Filter the list of available icon service.
		 *
		 * This can be used to change icons or add custom icons (additionally to variations in the editor).
		 * Icons should be directly renderable - therefore SVGs work best.
		 *
		 * @since 1.0.0
		 *
		 * @param array $services_data The list of services. Each item is an array containing a 'name' and 'icon' key.
		 * @return array The list of icon services.
		 * Convert the service to title case and return.
		 */
		$services_data = apply_filters( 'ziorwebdev_icon_get_services', $services_data );

		if ( ! empty( $service )
			&& ! empty( $field )
			&& isset( $services_data[ $service ] )
			&& ( 'icon' === $field || 'name' === $field )
		) {
			return $services_data[ $service ][ $field ];
		} elseif ( ! empty( $service ) && isset( $services_data[ $service ] ) ) {
			return $services_data[ $service ];
		}

		return $services_data;
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
	 * Inject parent icon-picker attributes into child icon context.
	 *
	 * @param array  $context      The current block context.
	 * @param array  $parsed_block The parsed block array.
	 * @param object $parent_block The parent block object.
	 *
	 * @return array Modified block context.
	 */
	public function inject_parent_context( $context, $parsed_block, $parent_block ) {
		// Only apply to the child block.
		if ( ! isset( $parsed_block['blockName'] ) || 'ziorwebdev/icon' !== $parsed_block['blockName'] ) {
			return $context;
		}

		// Ensure parent exists and is icon-picker.
		if ( ! isset( $parent_block->parsed_block['blockName'] )
			|| 'ziorwebdev/icon-picker' !== $parent_block->parsed_block['blockName'] ) {
			return $context;
		}

		$parent_attrs = $parent_block->parsed_block['attrs'] ?? array();

		// Pass parent attributes into child context.
		foreach ( array( 'iconUrl', 'iconColorValue', 'iconBackgroundColorValue', 'showLabels', 'size', 'openInNewTab' ) as $key ) {
			if ( isset( $parent_attrs[ $key ] ) ) {
				$context[ $key ] = $parent_attrs[ $key ];
			}
		}

		return $context;
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
