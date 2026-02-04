import { useEffect, useLayoutEffect, useRef } from '@wordpress/element';
import { useSelect } from '@wordpress/data';
import { store as blockEditorStore } from '@wordpress/block-editor';
import { getBlobByURL, isBlobURL, revokeBlobURL } from '@wordpress/blob';

type MediaItem = { url?: string; [k: string]: unknown };

type MediaUploadArgs = {
  filesList: File[];
  allowedTypes?: string[] | null;
  onFileChange: (media: MediaItem[]) => void;
  onError: (message: string) => void;
};

type BlockEditorSettings = {
  mediaUpload?: (args: MediaUploadArgs) => void;
  [k: string]: unknown;
};

type UploadMediaArgs = {
  url?: string;
  allowedTypes?: string[] | null;
  onChange?: (media: MediaItem) => void;
  onError?: (message: string) => void;
};

export function useUploadMediaFromBlobURL(args: UploadMediaArgs = {}): void {
  const latestArgsRef = useRef<UploadMediaArgs>(args);
  const hasUploadStartedRef = useRef<boolean>(false);

  const getSettings = useSelect(
    (select) => select(blockEditorStore).getSettings as () => BlockEditorSettings,
    []
  );

  useLayoutEffect(() => {
    latestArgsRef.current = args;
  }, [args]);

  useEffect(() => {
    if (hasUploadStartedRef.current) return;

    const current = latestArgsRef.current;
    if (!current.url || !isBlobURL(current.url)) return;

    const file = getBlobByURL(current.url) as File | undefined;
    if (!file) return;

    const {
      url,
      allowedTypes,
      onChange = () => {},
      onError = () => {},
    } = current;

    const settings = getSettings?.();
    const mediaUpload = settings?.mediaUpload;
    if (!mediaUpload) return;

    hasUploadStartedRef.current = true;

    mediaUpload({
      filesList: [file],
      allowedTypes: allowedTypes ?? null,
      onFileChange: ([media]) => {
        if (isBlobURL(media?.url)) return;

        if (url) revokeBlobURL(url);
        onChange(media);
        hasUploadStartedRef.current = false;
      },
      onError: (message) => {
        if (url) revokeBlobURL(url);
        onError(message);
        hasUploadStartedRef.current = false;
      },
    });
  }, [getSettings]);
}
