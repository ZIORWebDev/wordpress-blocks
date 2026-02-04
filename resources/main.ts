import './style.scss';

type Maybe<T> = T | null;

const WRAP_SELECTOR = '.wp-block-zior-add-to-cart.zior-add-to-cart';
const BTN_SELECTOR = 'button.wp-block-button__link';
const LINK_SELECTOR = 'a.wp-block-button__link';

function toStr(v: unknown, fallback = ''): string {
  return v === null || v === undefined ? fallback : String(v);
}

function toQty(v: unknown, fallback = 1): number {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

function buildAddToCartHref(productId: string, qty: number): string {
  return `/?add-to-cart=${encodeURIComponent(productId)}&quantity=${encodeURIComponent(
    String(qty)
  )}`;
}

function enhanceWrap(wrap: HTMLElement): void {
  const productId = toStr(wrap.getAttribute('data-product-id')).trim();
  if (!productId) return;

  const qty = toQty(wrap.getAttribute('data-quantity'), 1);

  // Already has a link version — assume already enhanced
  if (wrap.querySelector(LINK_SELECTOR)) return;

  const btn = wrap.querySelector(BTN_SELECTOR) as Maybe<HTMLButtonElement>;
  if (!btn) return;

  const href = buildAddToCartHref(productId, qty);

  // Create <a> to match Woo loop add-to-cart markup expectations
  const a = document.createElement('a');

  // Preserve existing button classes (wp-block-button__link wp-element-button)
  const existingClass = btn.getAttribute('class') || '';
  a.setAttribute(
    'class',
    `${existingClass} add_to_cart_button ajax_add_to_cart`.trim()
  );

  a.setAttribute('href', href);
  a.setAttribute('data-product_id', productId); // underscore: Woo expects this
  a.setAttribute('data-quantity', String(qty));

  const ariaLabel = btn.getAttribute('aria-label');
  if (ariaLabel) a.setAttribute('aria-label', ariaLabel);

  // Preserve text
  a.textContent = btn.textContent || '';

  // Replace button with anchor
  btn.replaceWith(a);
}

function init(root: ParentNode = document): void {
  const wraps = root.querySelectorAll<HTMLElement>(WRAP_SELECTOR);
  wraps.forEach(enhanceWrap);
}

function onDomReady(fn: () => void): void {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fn, { once: true });
  } else {
    fn();
  }
}

onDomReady(() => {
  init();

  // WooCommerce often triggers this after AJAX fragment updates
  document.body.addEventListener('wc_fragments_loaded' as any, () => init());
  document.body.addEventListener('updated_wc_div' as any, () => init());

  // If your site uses WP's navigation / partial renders, observe DOM changes too
  const observer = new MutationObserver((mutations) => {
    for (const m of mutations) {
      m.addedNodes.forEach((node) => {
        if (node instanceof HTMLElement) {
          // Run init on newly added subtree only (cheaper than full init)
          init(node);
        }
      });
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
});
