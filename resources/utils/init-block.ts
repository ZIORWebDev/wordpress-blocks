// initBlock.ts
import {
	registerBlockType,
	type Block,
	type BlockConfiguration,
} from '@wordpress/blocks';

export type BlockModule<
	TAttributes extends Record<string, unknown> = Record<string, unknown>
> = {
	name: string;
	metadata?: Record<string, unknown>;
	settings: BlockConfiguration<TAttributes>;
};

/**
 * Register a single block module.
 *
 * Notes:
 * - Input is generic (so `edit/save` are strongly typed).
 * - Output is widened to WP’s return type to avoid React variance issues.
 */
export default function initBlock<
	TAttributes extends Record<string, unknown> = Record<string, unknown>
>(block?: BlockModule<TAttributes>): Block<Record<string, any>> | undefined {
	if (!block) return undefined;

	const { name, metadata, settings } = block;

	// `metadata` is optional; avoid spreading `undefined`.
	const config = (metadata ? { name, ...metadata } : { name }) as any;

	// Widen return type to match WP typings.
	return registerBlockType(config, settings) as unknown as Block<Record<string, any>>;
}
