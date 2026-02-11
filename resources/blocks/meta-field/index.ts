/**
 * WordPress dependencies
 */
import { __, sprintf } from '@wordpress/i18n';
import type { BlockConfiguration } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import initBlock from '../../utils/init-block';
import edit from './edit';
import metadata from '../../../src/Blocks/MetaField/block.json';
import save from './save';

export const name = metadata.name;
export { metadata };

/**
 * Block attribute types (keep aligned with block.json)
 */
export interface MetaFieldBlockAttributes extends Record<string, unknown> {
	content?: string;
	level?: number;
	textAlign?: 'left' | 'center' | 'right' | 'justify';
	metadata?: {
		name?: string;
	};
}

/**
 * Context passed to __experimentalLabel
 */
type ExperimentalLabelContext = 'list-view' | 'accessibility' | string;

interface ExperimentalLabelOptions {
	context?: ExperimentalLabelContext;
}

/**
 * WP doesn't export a stable TS type for __experimentalLabel.
 */
type ExperimentalLabelFn = (
	attributes: MetaFieldBlockAttributes,
	options: ExperimentalLabelOptions,
) => string | undefined;

/**
 * Extend BlockConfiguration to allow experimental props while keeping strict typing.
 */
type BlockConfigurationWithExperimentalLabel<
	TAttributes extends Record<string, unknown>,
> = BlockConfiguration<TAttributes> & {
	__experimentalLabel?: ExperimentalLabelFn;
};

/**
 * Block settings (typed)
 *
 * IMPORTANT:
 * BlockConfiguration requires: title, category, attributes.
 * We provide them from metadata explicitly (instead of spreading ...metadata),
 * because JSON imports widen literal types and can break Gutenberg attribute typing.
 */
export const settings: BlockConfigurationWithExperimentalLabel<MetaFieldBlockAttributes> =
	{
		// Required by BlockConfiguration
		title: metadata.title,
		category: metadata.category,

		// JSON import widens literals, so we cast at this boundary only.
		attributes:
			metadata.attributes as unknown as BlockConfiguration<MetaFieldBlockAttributes>['attributes'],

		// Optional extras
		icon: 'welcome-write-blog',

		example: {
			attributes: {
				content: __('Code is Poetry'),
				level: 2,
				textAlign: 'center',
			},
		},

		__experimentalLabel: (attributes, { context }) => {
			const content = attributes.content ?? '';
			const hasContent = content.trim().length > 0;

			const customName = attributes.metadata?.name;
			const levelText = String(attributes.level ?? 2); // sprintf typings require string

			// In the list view, use the block's content as the label.
			// If the content is empty, fall back to the default label.
			if (context === 'list-view' && (customName || hasContent)) {
				return customName || content;
			}

			if (context === 'accessibility') {
				return !hasContent
					? sprintf(
							/* translators: accessibility text. %s: heading level. */
							__('Level %s. Empty.'),
							levelText,
						)
					: sprintf(
							/* translators: accessibility text. 1: heading level. 2: heading content. */
							__('Level %1$s. %2$s'),
							levelText,
							content,
						);
			}

			return undefined;
		},

		merge: (attributes, attributesToMerge) => ({
			content: (attributes.content ?? '') + (attributesToMerge.content ?? ''),
		}),

		edit,
		save,
	};

export const init = () =>
	initBlock<MetaFieldBlockAttributes>({ name, metadata, settings });
