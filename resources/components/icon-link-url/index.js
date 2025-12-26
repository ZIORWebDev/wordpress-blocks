const { URLPopover, URLInput, store: blockEditorStore } = wp.blockEditor;
const {
  ToolbarButton,
  __experimentalInputControlSuffixWrapper: InputControlSuffixWrapper,
} = wp.components;
const { __ } = wp.i18n;
const { useDispatch } = wp.data;
const { DELETE, BACKSPACE, ENTER } = wp.keycodes;

const IconLinkURLPopover = ({
  iconUrl,
  setAttributes,
  setPopover,
  popoverAnchor,
}) => {
  const { removeBlock } = useDispatch(blockEditorStore);
  return (
    <URLPopover
      anchor={popoverAnchor}
      aria-label={__('Edit icon link')}
      onClose={() => setPopover(false)}
    >
      <form
        className="block-editor-url-popover__link-editor"
        onSubmit={(event) => {
          event.preventDefault();
          setPopover(false);
        }}
      >
        <div className="block-editor-url-input">
          <URLInput
            value={iconUrl}
            onChange={(nextURL) => setAttributes({ iconUrl: nextURL })}
            placeholder={__('Enter link')}
            label={__('Enter link')}
            hideLabelFromVision
            disableSuggestions
            onKeyDown={(event) => {
              if (
                !!iconUrl ||
                event.defaultPrevented ||
                ![BACKSPACE, DELETE].includes(event.keyCode)
              ) {
                return;
              }
              removeBlock(clientId);
            }}
            suffix={
              <InputControlSuffixWrapper variant="control">
                <ToolbarButton
                  icon="arrow-right-alt2"
                  label={__('Apply')}
                  type="submit"
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
