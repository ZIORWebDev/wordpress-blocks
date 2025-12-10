/**
 * WordPress dependencies
 */
const {
  i18n: { __ },
} = wp;

/**
 * Internal dependencies
 */
import { ChainIcon } from './icons';

/**
 * Retrieves the icon service's icon component and label.
 *
 * @param {Object} variation The object of the icon service variation.
 * @return {Object} An object containing the Icon component for icon service and label.
 */
export function getIconService(variation) {
  if (!variation?.name) {
    return {
      icon: ChainIcon,
      label: __('Chain Icon'),
    };
  }

  return {
    icon: variation?.icon ?? ChainIcon,
    label: variation?.title ?? __('Chain Icon'),
  };
}
