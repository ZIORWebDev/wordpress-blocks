/* global wp */

/**
 * WordPress dependencies
 */
const { getBlockType, hasBlockSupport } = wp.blocks;

/**
 * Types
 */
type UnknownRecord = Record<string, unknown>;

type Metadata = {
  id?: unknown;
  bindings?: unknown;
  // Keep open to other metadata keys we might receive (we'll filter explicitly).
  [key: string]: unknown;
};

type BlockAttributes = {
  anchor?: string;
  ariaLabel?: string;
  metadata?: Metadata;
  // Other attributes may exist; we preserve only supported ones.
  [key: string]: unknown;
};

type BindingsTransformer<TIn = unknown, TOut = unknown> = (bindings: TIn) => TOut;

/**
 * Transform block support attributes and metadata during block transforms.
 *
 * Preserves:
 * - `anchor` if the target block supports it
 * - `ariaLabel` if the target block supports it
 * - `metadata.id` and `metadata.bindings` if a bindings transformer is provided
 *
 * Returns `undefined` when there is nothing to preserve.
 */
export function getTransformedAttributes<
  TAttributes extends BlockAttributes = BlockAttributes,
  TBindingsIn = unknown,
  TBindingsOut = unknown,
>(
  attributes: TAttributes | null | undefined,
  newBlockName: string,
  bindingsTransformer?: BindingsTransformer<TBindingsIn, TBindingsOut>,
): Partial<TAttributes> | undefined {
  if (!attributes) return undefined;

  const newBlockType = getBlockType(newBlockName);
  if (!newBlockType) return undefined;

  const result: UnknownRecord = {};

  // Block supports-derived attrs (handled explicitly).
  if (
    hasBlockSupport(newBlockType, 'anchor') &&
    typeof attributes.anchor === 'string' &&
    attributes.anchor.length > 0
  ) {
    result.anchor = attributes.anchor;
  }

  if (
    hasBlockSupport(newBlockType, 'ariaLabel') &&
    typeof attributes.ariaLabel === 'string' &&
    attributes.ariaLabel.length > 0
  ) {
    result.ariaLabel = attributes.ariaLabel;
  }

  // Metadata
  const metadata = attributes.metadata;
  if (metadata && typeof metadata === 'object') {
    // Only preserve metadata keys we explicitly allow.
    const metaOut: UnknownRecord = {};

    if ('id' in metadata) {
      // Preserve as-is.
      metaOut.id = (metadata as Metadata).id;
    }

    if (bindingsTransformer && 'bindings' in metadata) {
      metaOut.bindings = bindingsTransformer((metadata as Metadata).bindings as TBindingsIn);
    }

    if (Object.keys(metaOut).length > 0) {
      result.metadata = metaOut;
    }
  }

  return Object.keys(result).length > 0 ? (result as Partial<TAttributes>) : undefined;
}
