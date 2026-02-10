<?php
/**
 * Base Block
 *
 * @package ZIORWebDev\WordPressBlocks
 */

namespace ZIORWebDev\WordPressBlocks\Blocks;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Base Block
 */
abstract class Base {

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
	 * REST API routes.
	 *
	 * @var array
	 */
	protected $routes = array();

	/**
	 * Constructor.
	 */
	public function __construct() {
		if ( empty( $this->block_name ) ) {
			throw new \Exception( 'Block must define $block_name.' );
		}

		/**
		 * Hook to register the block.
		 */
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
	 * Permission check for REST API routes.
	 *
	 * @param \WP_REST_Request $request The REST request.
	 * @return bool
	 */
	public function get_permission( $request ) {
		return wp_verify_nonce( $request->get_header( 'X-WP-Nonce' ), 'wp_rest' );
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
