/**
 * External dependencies
 */
import removeAccents from 'remove-accents';

/**
 * Object map tracking anchors.
 *
 * Key: clientId
 * Value: generated anchor (or null when content can't produce a slug)
 */
const anchors: Record<string, string | null> = Object.create(null);

/**
 * Returns the plain text (no markup) from an HTML string.
 *
 * Note: This runs in the browser (uses DOM APIs).
 */
const getTextWithoutMarkup = (html: string): string => {
	// Fast path: avoid DOM work for plain strings (no tags/entities).
	// This keeps behavior the same for real HTML strings.
	if (!/[<&]/.test(html)) return html;

	const dummyElement = document.createElement('div');
	dummyElement.innerHTML = html;
	return dummyElement.innerText;
};

/**
 * Get the slug from the content.
 */
const getSlug = (content: string): string => {
	return (
		removeAccents(getTextWithoutMarkup(content))
			// Convert anything that's not a letter or number to a hyphen.
			.replace(/[^\p{L}\p{N}]+/gu, '-')
			// Convert to lowercase.
			.toLowerCase()
			// Remove any remaining leading or trailing hyphens.
			.replace(/(^-+)|(-+$)/g, '')
	);
};

/**
 * Generate the anchor for a heading.
 *
 * Returns null when content does not produce a slug. Returning null instead of an empty
 * string allows consumers to re-check when the content changes.
 */
export const generateAnchor = (
	clientId: string,
	content: string
): string | null => {
	const slug = getSlug(content);

	if (slug === '') {
		return null;
	}

	// Remove stale value for this clientId before generating a new unique anchor.
	delete anchors[clientId];

	let anchor = slug;
	let i = 0;

	// Ensure uniqueness among existing anchors.
	// (Using Object.values preserves the original behavior.)
	while (Object.values(anchors).includes(anchor)) {
		i += 1;
		anchor = `${slug}-${i}`;
	}

	return anchor;
};

/**
 * Set the anchor for a heading.
 */
export const setAnchor = (clientId: string, anchor: string | null): void => {
	anchors[clientId] = anchor;
};
