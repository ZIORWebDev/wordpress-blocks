/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { ChainIcon } from './icons';

/**
 * Shape of a block variation we care about.
 * Keep this minimal and future-proof.
 */
export type IconServiceVariation = {
	name?: string;
	icon?: unknown;
	title?: string;
};

/**
 * Return type for the icon service resolver.
 */
export type IconServiceResult = {
	icon: unknown;
	label: string;
};

/**
 * Retrieves the icon service's icon component and label.
 *
 * @param variation The object of the icon service variation.
 * @return An object containing the Icon component and label.
 */
export function getIconService(
	variation?: IconServiceVariation
): IconServiceResult {
	if (!variation?.name) {
		return {
			icon: ChainIcon,
			label: __('Chain Icon', 'wordpress-blocks'),
		};
	}

	return {
		icon: variation.icon ?? ChainIcon,
		label: variation.title ?? __('Chain Icon', 'wordpress-blocks'),
	};
}
