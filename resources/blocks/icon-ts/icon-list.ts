import { __ } from '@wordpress/i18n';
import type { IconType } from '@wordpress/components';

import { ChainIcon } from './icons/chain';
import { normalizeWpIcon } from '../../utils/icon-lists';

type VariationLike = {
	name?: string;
	icon?: unknown;
	title?: string;
};

export function getIconService(
	variation?: VariationLike | null
): { icon: IconType; label: string } {
	const fallback: { icon: IconType; label: string } = {
		icon: ChainIcon as IconType,
		label: __('Chain Icon'),
	};

	if (!variation?.name) return fallback;

	return {
		icon: normalizeWpIcon(variation.icon) ?? fallback.icon,
		label: variation.title ?? fallback.label,
	};
}
