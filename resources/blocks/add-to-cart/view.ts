/**
 * Frontend add-to-cart behavior for both markup variants:
 *
 * Variant A (link):
 *  <a class="wp-block-button__link wp-element-button">Get Product</a>
 *
 * Variant B (button):
 *  <button type="button" class="wp-block-button__link wp-element-button">Get Product</button>
 *
 * - Syncs wrapper data-quantity when qty input exists (show_quantity=1).
 * - On click, performs WC AJAX add_to_cart and triggers Woo's "added_to_cart".
 * - Uses WooCommerce BlockUI effect while request is in-flight.
 * - No UI messages.
 */

const BLOCK_SELECTOR = '.wp-block-zior-add-to-cart.zior-add-to-cart';
const QTY_SELECTOR = 'input.zior-add-to-cart__qty';
const CTA_SELECTOR = '.wp-block-button__link'; // matches both <a> and <button>

function clampQty(raw: string): number {
	const n = parseInt(raw, 10);
	return Number.isFinite(n) && n > 0 ? n : 1;
}

function getWcAjaxAddToCartUrl(): string {
	const template = window.wc_add_to_cart_params?.wc_ajax_url;
	if (template && template.includes('%%endpoint%%')) {
		return template.replace('%%endpoint%%', 'add_to_cart');
	}
	return '/?wc-ajax=add_to_cart';
}

function getQtyFromBlock(root: HTMLElement): number {
	const input = root.querySelector<HTMLInputElement>(QTY_SELECTOR);
	if (!input) return 1;

	const qty = clampQty(input.value);
	if (String(qty) !== input.value) input.value = String(qty);
	return qty;
}

function syncDataQuantity(root: HTMLElement, qty: number): void {
	root.dataset.quantity = String(qty);
}

function blockUI(root: HTMLElement): void {
	const $ = window.jQuery;
	if ($?.fn?.block) {
		$(root).block({
			message: null,
			overlayCSS: { background: '#fff', opacity: 0.6 },
		});
		return;
	}

	// Fallback (if BlockUI missing)
	root.classList.add('is-processing');
	root.setAttribute('aria-busy', 'true');
}

function unblockUI(root: HTMLElement): void {
	const $ = window.jQuery;
	if ($?.fn?.unblock) {
		$(root).unblock();
		return;
	}

	root.classList.remove('is-processing');
	root.removeAttribute('aria-busy');
}

async function ajaxAddToCart(productId: string, quantity: number): Promise<any> {
	const url = getWcAjaxAddToCartUrl();

	const body = new URLSearchParams();
	body.set('product_id', productId);
	body.set('quantity', String(quantity));

	const res = await fetch(url, {
		method: 'POST',
		credentials: 'same-origin',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
			'X-Requested-With': 'XMLHttpRequest',
		},
		body: body.toString(),
	});

	return res.json();
}

function getCta(root: HTMLElement): HTMLAnchorElement | HTMLButtonElement | null {
	const el = root.querySelector<HTMLElement>(CTA_SELECTOR);
	if (!el) return null;

	// Ensure it's either <a> or <button> (both are valid in your markup)
	if (el instanceof HTMLAnchorElement || el instanceof HTMLButtonElement) return el;
	return null;
}

function initBlock(root: HTMLElement): void {
	// Initial sync
	syncDataQuantity(root, getQtyFromBlock(root));

	// Keep wrapper dataset in sync with qty input changes (if it exists)
	const input = root.querySelector<HTMLInputElement>(QTY_SELECTOR);
	if (input) {
		input.addEventListener('input', () => {
			syncDataQuantity(root, getQtyFromBlock(root));
		});
	}

	const cta = getCta(root);
	if (!cta) return;

	let inFlight = false;

	cta.addEventListener('click', async (e) => {
		// Prevent navigation for <a>; harmless for <button>
		e.preventDefault();
		if (inFlight) return;

		const productId = (root.dataset.productId || '').trim();
		if (!productId) return;

		const qty = getQtyFromBlock(root);
		syncDataQuantity(root, qty);

		inFlight = true;
		blockUI(root);

		// Optional WC hook: before request
		const $ = window.jQuery;
		if ($) {
			try {
				$(document.body).trigger('adding_to_cart', [cta, { product_id: productId, quantity: qty }]);
			} catch {
				// ignore
			}
		}

		try {
			const data = await ajaxAddToCart(productId, qty);

			// Core-like error handling: redirect to product URL when provided
			if (data?.error) {
				const fallback =
					typeof data.product_url === 'string'
						? data.product_url
						: `/?add-to-cart=${encodeURIComponent(productId)}&quantity=${encodeURIComponent(String(qty))}`;

				window.location.href = fallback;
				return;
			}

			// Trigger WooCommerce "added_to_cart" AFTER success
			if ($) {
				try {
					$(document.body).trigger('added_to_cart', [
						data?.fragments ?? {},
						data?.cart_hash ?? '',
						cta,
					]);
				} catch {
					// ignore
				}
			}
		} catch {
			// No messages requested; silently fail
		} finally {
			unblockUI(root);
			inFlight = false;
		}
	});
}

function init(): void {
	document.querySelectorAll<HTMLElement>(BLOCK_SELECTOR).forEach(initBlock);
}

if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', init);
} else {
	init();
}
