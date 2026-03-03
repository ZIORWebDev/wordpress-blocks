import apiFetch from '@wordpress/api-fetch';

export async function resetCache() {
	return apiFetch({
		path: `/${ZIORWPBlocks.restUrl}/cache/reset`,
		method: 'DELETE',
	});
}

/**
 * Attach click handler
 */
function initCacheResetButton() {
	const button = document.querySelector<HTMLButtonElement>('#simpliBlocksCacheReset');

	if (!button) return;

	button.addEventListener('click', async (event) => {
		event.preventDefault();

		button.disabled = true;
		button.textContent = 'Resetting...';

		try {
			const result = await resetCache();

			console.log('Cache reset success:', result);
			button.textContent = 'Cache Reset';
		} catch (error) {
			console.error('Cache reset failed:', error);
			button.textContent = 'Reset Failed';
		} finally {
			setTimeout(() => {
				button.disabled = false;
				button.textContent = 'Reset Cache';
			}, 2000);
		}
	});
}

/**
 * Ensure DOM is ready
 */
document.addEventListener('DOMContentLoaded', initCacheResetButton);