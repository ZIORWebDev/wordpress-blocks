<?php
/**
 * Base Block
 *
 * @package ZiorWebDev\WordPressBlocks
 */

namespace ZiorWebDev\WordPressBlocks\Blocks;

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
	 * Path of the block.json file.
	 *
	 * @var string
	 */
	protected $block_json;

	/**
	 * Constructor.
	 */
	public function __construct() {
		if ( empty( $this->block_name ) ) {
			throw new \Exception( 'Block must define $block_name.' );
		}

		add_action( 'init', array( $this, 'register' ) );
	}

	/**
	 * Register the block.
	 * 
	 * @return void
	 */
	public function register() {
		register_block_type_from_metadata(
			$this->block_json,
			array(
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
	abstract public function render( $attributes, $content, $block );
}
