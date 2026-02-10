/**
 * External dependencies
 */
import * as React from '@wordpress/element';

/**
 * WordPress dependencies
 */
import domReady from '@wordpress/dom-ready';
import { _x } from '@wordpress/i18n';
import {
	getBlockVariations,
	registerBlockVariation,
	type BlockVariation,
} from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import { ChainIcon, UpworkIcon } from './icons';

type ServiceAttributes = {
	service: string;
};

type IconVariation = Omit<BlockVariation, 'attributes'> & {
	attributes: ServiceAttributes;
	isActive?: (
		blockAttributes: Record<string, unknown>,
		variationAttributes: Record<string, unknown>
	) => boolean;
};

/* -------------------------------------------------------------------------- */
/* Helpers (⬅ hoisted so TS can see them everywhere)                           */
/* -------------------------------------------------------------------------- */

const toTitleCase = (str: string): string =>
	str
		.replace(/[^a-zA-Z0-9]+/g, ' ')
		.trim()
		.replace(/\s+/g, ' ')
		.replace(/\b\w/g, (c) => c.toUpperCase());

const dashicon = (slug: string) => (
	<span className={`dashicons dashicons-${slug}`} />
);

const isActive = (
	blockAttributes: Record<string, unknown>,
	variationAttributes: Record<string, unknown>
): boolean => {
	const blockService = (blockAttributes as Partial<ServiceAttributes>).service;
	const variationService =
		(variationAttributes as Partial<ServiceAttributes>).service;

	return blockService === variationService;
};

/* -------------------------------------------------------------------------- */
/* Static variations                                                          */
/* -------------------------------------------------------------------------- */

const variations: IconVariation[] = [
	{
		name: 'chain',
		attributes: { service: 'chain' },
		title: _x('Chain', 'wordpress-blocks'),
		icon: ChainIcon,
	},
	{
		name: 'upwork',
		attributes: { service: 'upwork' },
		title: _x('Upwork', 'wordpress-blocks'),
		icon: UpworkIcon,
	},
];

variations.forEach((variation) => {
	if (!variation.isActive) {
		variation.isActive = isActive;
	}
});

export default variations;

/* -------------------------------------------------------------------------- */
/* Dynamic registration                                                       */
/* -------------------------------------------------------------------------- */

domReady(() => {
	type RegisterableVariation = {
		name: string;
		title: string;
		icon: BlockVariation['icon'];
		attributes: ServiceAttributes;
	};

	const allVariations: RegisterableVariation[] = [];

	// core/social-link variations
	(getBlockVariations('core/social-link') ?? []).forEach((variation) => {
		const icon =
			typeof variation.icon === 'function'
				? variation.icon()
				: variation.icon;

		allVariations.push({
			name: variation.name,
			title: variation.title,
			icon,
			attributes: (variation.attributes ?? {}) as ServiceAttributes,
		});
	});


	// Dashicons
	const dashIcons: readonly string[] = [
		'admin-appearance',
		'admin-collapse',
		'admin-comments',
		'admin-customizer',
		'admin-generic',
		'admin-home',
		'admin-links',
		'admin-media',
		'admin-multisite',
		'admin-network',
		'admin-page',
		'admin-plugins',
		'admin-post',
		'admin-settings',
		'admin-site',
		'admin-site-alt',
		'admin-site-alt2',
		'admin-site-alt3',
		'admin-tools',
		'admin-users',
		'airplane',
		'album',
		'align-center',
		'align-full-width',
		'align-left',
		'align-none',
		'align-pull-left',
		'align-pull-right',
		'align-right',
		'align-wide',
		'analytics',
		'archive',
		'arrow-down',
		'arrow-down-alt',
		'arrow-down-alt2',
		'arrow-left',
		'arrow-left-alt',
		'arrow-left-alt2',
		'arrow-right',
		'arrow-right-alt',
		'arrow-right-alt2',
		'arrow-up',
		'arrow-up-alt',
		'arrow-up-alt2',
		'arrow-up-duplicate',
		'art',
		'awards',
		'backup',
		'bank',
		'beer',
		'bell',
		'block-default',
		'book',
		'book-alt',
		'buddicons-activity',
		'buddicons-bbpress-logo',
		'buddicons-buddypress-logo',
		'buddicons-community',
		'buddicons-forums',
		'buddicons-friends',
		'buddicons-groups',
		'buddicons-pm',
		'buddicons-replies',
		'buddicons-topics',
		'buddicons-tracking',
		'building',
		'businessman',
		'businessperson',
		'businesswoman',
		'button',
		'calculator',
		'calendar',
		'calendar-alt',
		'camera',
		'camera-alt',
		'car',
		'carrot',
		'cart',
		'category',
		'chart-area',
		'chart-bar',
		'chart-line',
		'chart-pie',
		'clipboard',
		'clock',
		'cloud',
		'cloud-saved',
		'cloud-upload',
		'code-standards',
		'coffee',
		'color-picker',
		'columns',
		'controls-back',
		'controls-forward',
		'controls-pause',
		'controls-play',
		'controls-repeat',
		'controls-skipback',
		'controls-skipforward',
		'controls-volumeoff',
		'controls-volumeon',
		'cover-image',
		'dashboard',
		'database',
		'database-add',
		'database-export',
		'database-import',
		'database-remove',
		'database-view',
		'desktop',
		'dismiss',
		'download',
		'drumstick',
		'edit',
		'editor-aligncenter',
		'editor-alignleft',
		'editor-alignright',
		'editor-bold',
		'editor-break',
		'editor-code',
		'editor-code-duplicate',
		'editor-contract',
		'editor-customchar',
		'editor-distractionfree',
		'editor-expand',
		'editor-help',
		'editor-indent',
		'editor-insertmore',
		'editor-italic',
		'editor-justify',
		'editor-kitchensink',
		'editor-ltr',
		'editor-ol',
		'editor-ol-rtl',
		'editor-outdent',
		'editor-paragraph',
		'editor-paste-text',
		'editor-paste-word',
		'editor-quote',
		'editor-removeformatting',
		'editor-rtl',
		'editor-spellcheck',
		'editor-strikethrough',
		'editor-table',
		'editor-textcolor',
		'editor-ul',
		'editor-underline',
		'editor-unlink',
		'editor-video',
		'edit-large',
		'edit-page',
		'ellipsis',
		'email',
		'email-alt',
		'email-alt2',
		'embed-audio',
		'embed-generic',
		'embed-photo',
		'embed-post',
		'embed-video',
		'excerpt-view',
		'exerpt-view',
		'exit',
		'external',
		'facebook-alt',
		'feedback',
		'filter',
		'flag',
		'food',
		'format-aside',
		'format-audio',
		'format-chat',
		'format-gallery',
		'format-image',
		'format-links',
		'format-quote',
		'format-standard',
		'format-status',
		'format-video',
		'forms',
		'fullscreen-alt',
		'fullscreen-exit-alt',
		'games',
		'googleplus',
		'grid-view',
		'groups',
		'hammer',
		'heading',
		'heart',
		'hidden',
		'hourglass',
		'html',
		'id',
		'id-alt',
		'images-alt',
		'images-alt2',
		'image-crop',
		'image-filter',
		'image-flip-horizontal',
		'image-flip-vertical',
		'image-rotate',
		'image-rotate-left',
		'image-rotate-right',
		'index-card',
		'info',
		'info-outline',
		'insert',
		'insert-after',
		'insert-before',
		'laptop',
		'layout',
		'leftright',
		'lightbulb',
		'linkedin',
		'list-view',
		'location',
		'location-alt',
		'lock',
		'lock-duplicate',
		'marker',
		'media-archive',
		'media-audio',
		'media-code',
		'media-default',
		'media-document',
		'media-interactive',
		'media-spreadsheet',
		'media-text',
		'media-video',
		'megaphone',
		'menu',
		'menu-alt',
		'menu-alt2',
		'menu-alt3',
		'microphone',
		'migrate',
		'minus',
		'money',
		'money-alt',
		'move',
		'nametag',
		'networking',
		'no',
		'no-alt',
		'open-folder',
		'palmtree',
		'paperclip',
		'pdf',
		'performance',
		'pets',
		'phone',
		'pinterest',
		'playlist-audio',
		'playlist-video',
		'plugins-checked',
		'plus',
		'plus-alt',
		'plus-alt2',
		'podio',
		'portfolio',
		'post-status',
		'post-trash',
		'pressthis',
		'printer',
		'privacy',
		'products',
		'randomize',
		'redo',
		'remove',
		'rest-api',
		'rss',
		'saved',
		'schedule',
		'screenoptions',
		'search',
		'share',
		'share1',
		'share-alt',
		'share-alt2',
		'shield',
		'shield-alt',
		'shortcode',
		'slides',
		'smartphone',
		'smiley',
		'sort',
		'sos',
		'star-empty',
		'star-filled',
		'star-half',
		'sticky',
		'store',
		'superhero',
		'superhero-alt',
		'tablet',
		'table-col-after',
		'table-col-before',
		'table-col-delete',
		'table-row-after',
		'table-row-before',
		'table-row-delete',
		'tag',
		'tagcloud',
		'testimonial',
		'text',
		'text-page',
		'thumbs-down',
		'thumbs-up',
		'tickets',
		'tickets-alt',
		'tide',
		'translation',
		'trash',
		'twitter-alt',
		'undo',
		'universal-access',
		'universal-access-alt',
		'unlock',
		'update',
		'update-alt',
		'upload',
		'vault',
		'video-alt',
		'video-alt2',
		'video-alt3',
		'visibility',
		'warning',
		'welcome-add-page',
		'welcome-comments',
		'welcome-edit-page',
		'welcome-learn-more',
		'welcome-view-site',
		'welcome-widgets-menus',
		'welcome-write-blog',
		'xing',
		'yes',
		'yes-alt'
	];

	dashIcons.forEach((slug) => {
		allVariations.push({
			name: slug,
			title: toTitleCase(slug),
			icon: dashicon(slug),
			attributes: { service: slug },
		});
	});

	allVariations.forEach((variation) => {
		registerBlockVariation('zior/icon', {
			...variation,
			isActive,
		});
	});
});
