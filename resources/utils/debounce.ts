// Debounce that prefers WordPress' bundled lodash (wp.lodash.debounce) when available,
// with a small, well-typed fallback implementation.
type AnyFn = (...args: any[]) => any;

declare global {
  interface Window {
    wp?: { lodash?: { debounce?: <F extends AnyFn>(fn: F, wait?: number) => AnyFn } };
    lodash?: { debounce?: <F extends AnyFn>(fn: F, wait?: number) => AnyFn };
    _?: { debounce?: <F extends AnyFn>(fn: F, wait?: number) => AnyFn };
  }
}

type Debounced<F extends AnyFn> = ((...args: Parameters<F>) => void) & {
  cancel: () => void;
  flush: () => void;
};

export function debounce<F extends AnyFn>(fn: F, wait = 0): Debounced<F> {
  // Prefer the WordPress environment's lodash debounce if present.
  const w = typeof window !== 'undefined' ? window : undefined;
  const lodashDebounce =
    w?.wp?.lodash?.debounce ?? w?.lodash?.debounce ?? w?._?.debounce;

  if (typeof lodashDebounce === 'function') {
    // We can’t guarantee lodash’s exact augmented return type at compile time,
    // so we cast to our Debounced shape (which matches lodash’s common API).
    return lodashDebounce(fn, wait) as unknown as Debounced<F>;
  }

  // Fallback: lightweight debounce (trailing only), preserving `this` and args.
  let timer: ReturnType<typeof setTimeout> | null = null;
  let lastThis: ThisParameterType<F>;
  let lastArgs: Parameters<F> | null = null;

  const debounced = function (this: ThisParameterType<F>, ...args: Parameters<F>) {
    lastThis = this;
    lastArgs = args;

    if (timer) clearTimeout(timer);

    timer = setTimeout(() => {
      timer = null;
      if (lastArgs) {
        fn.apply(lastThis as any, lastArgs);
        lastArgs = null;
      }
    }, wait);
  } as Debounced<F>;

  debounced.cancel = () => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    lastArgs = null;
  };

  debounced.flush = () => {
    if (!timer) return;
    clearTimeout(timer);
    timer = null;

    if (lastArgs) {
      fn.apply(lastThis as any, lastArgs);
      lastArgs = null;
    }
  };

  return debounced;
}
