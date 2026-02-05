import type { IconType } from '@wordpress/components';

export function normalizeWpIcon(icon: unknown): IconType | undefined {
	// Unwrap ESM default export (the “[object Module]” issue)
	if (icon && typeof icon === 'object' && 'default' in (icon as any)) {
		return (icon as any).default as IconType;
	}

	return icon as IconType | undefined;
}