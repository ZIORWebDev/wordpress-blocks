<?php
/**
 * Admin Settings Page Template
 *
 * @package ZIORWebDev\WordPressBlocks
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
?>

<div class="wrap">
	<h1><?php echo esc_html( $args['title'] ); ?></h1>
	<p><?php echo esc_html( $args['description'] ); ?></p>

	<form method="post">
		<?php wp_nonce_field( 'simpliblocks_clear_cache_action', 'simpliblocks_nonce' ); ?>
		<p>
			<input
				id="simpliBlocksCacheReset"
				type="submit"
				name="simpliblocks_clear_cache"
				class="button button-primary"
				value="<?php echo esc_attr( $args['button_label'] ); ?>"
			/>
		</p>
	</form>
</div>
