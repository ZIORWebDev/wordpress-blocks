<?php
/**
 * Base Controller
 *
 * @package ZIORWebDev\WordPressBlocks\Controllers
 */

namespace ZIORWebDev\WordPressBlocks\Controllers;

use ZIORWebDev\WordPressBlocks\Traits\Cache as CacheTrait;

/**
 * Base class
 *
 * @package ZIORWebDev\WordPressBlocks\Controllers;
 * @since 1.0.0
 */
abstract class Base {
	use CacheTrait;
}
