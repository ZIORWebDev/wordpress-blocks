<?php
/**
 * Base Block
 *
 * @package ZiorWebDev\WordPressBlocks
 */

namespace ZiorWebDev\WordPressBlocks;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Base Block
 */
abstract class BaseBlock {

	/**
	 * The name of the block.
	 *
	 * @var string
	 */
	protected $block_name;

	/**
	 * The attributes of the block.
	 *
	 * @var array
	 */
	protected $attributes = array();

	/**
	 * Constructor.
	 */
	public function __construct() {
		if ( empty( $this->block_name ) ) {
			throw new Exception( 'Block must define $block_name.' );
		}

		add_action( 'init', array( $this, 'register' ) );
	}

	/**
	 * Register the block.
	 * 
	 * @return void
	 */
	public function register() {
		register_block_type(
			$this->block_name,
			array(
				'attributes'      => $this->attributes,
				'render_callback' => array( $this, 'render' ),
			)
		);
	}

	/**
	* Render the block.
	*
	* @param array  $attributes Block attributes.
	* @param string $content    Inner block HTML.
	* @param array  $block      Block data.
	* @return string
	*/
	protected function render( $attributes, $content, $block ) {
		return $content;
	}

	/**
	* Register service icons.
	*
	* @param array $services
	* @return array
	*/
	protected function register_service_icon( array $services ) {
		return $services;
	}
}
