// wordpress.d.ts
export {};

declare global {
  interface WPBlockType {
    name: string;
    title?: string;
    supports?: Record<string, unknown>;
    attributes?: Record<string, unknown>;
    [key: string]: unknown;
  }

  const wp: {
    blocks?: {
      getBlockType?: (name: string) => WPBlockType | undefined;
      hasBlockSupport?: (blockTypeOrName: string | WPBlockType, feature: string) => boolean;
    };
  };
}
