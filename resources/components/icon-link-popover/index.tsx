import type { FC, FormEvent, KeyboardEvent } from 'react';
import { __ } from '@wordpress/i18n';
import { URLPopover, URLInput, store as blockEditorStore } from '@wordpress/block-editor';
import { useDispatch } from '@wordpress/data';
import { Button } from '@wordpress/components';
import { InputControlSuffixWrapper } from '@wordpress/components';

// If you already have these constants elsewhere, import them instead.
const BACKSPACE = 8;
const DELETE = 46;

type SetAttributes<T extends Record<string, unknown>> = (attrs: Partial<T>) => void;

type IconLinkAttributes = {
  url?: string;
};

export type IconLinkURLPopoverProps = {
  url?: string;
  setAttributes: SetAttributes<IconLinkAttributes>;
  setPopover: (open: boolean) => void;
  popoverAnchor?: HTMLElement | null;
  clientId: string;
};

const IconLinkURLPopover: FC<IconLinkURLPopoverProps> = ({
  url,
  setAttributes,
  setPopover,
  popoverAnchor,
  clientId,
}) => {
  const { removeBlock } = useDispatch(blockEditorStore);

  return (
    <URLPopover
      anchor={popoverAnchor ?? undefined}
      aria-label={__('Edit icon link')}
      onClose={() => {
        setPopover(false);
        popoverAnchor?.focus();
      }}
    >
      <form
        className="block-editor-url-popover__link-editor"
        onSubmit={(event: FormEvent<HTMLFormElement>) => {
          event.preventDefault();
          setPopover(false);
          popoverAnchor?.focus();
        }}
      >
        <div className="block-editor-url-input">
          <URLInput
            value={url ?? ''}
            onChange={(nextURL: string) => setAttributes({ url: nextURL })}
            placeholder={__('Enter link')}
            label={__('Enter link')}
            hideLabelFromVision
            disableSuggestions
            onKeyDown={(event: KeyboardEvent) => {
              // Some WP components still expose keyCode; keep it safe.
              const keyCode = (event as unknown as { keyCode?: number }).keyCode;

              if (
                !!url ||
                event.defaultPrevented ||
                !keyCode ||
                ![BACKSPACE, DELETE].includes(keyCode)
              ) {
                return;
              }

              removeBlock(clientId);
            }}
            suffix={
              <InputControlSuffixWrapper variant="control">
                <Button
                  icon="arrow-right-alt2"
                  label={__('Apply')}
                  type="submit"
                  size="small"
                />
              </InputControlSuffixWrapper>
            }
          />
        </div>
      </form>
    </URLPopover>
  );
};

export default IconLinkURLPopover;
