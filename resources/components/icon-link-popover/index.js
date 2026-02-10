// Block Editor
const { URLPopover, URLInput, store: blockEditorStore } = wp.blockEditor;

const IconLinkURLPopover = ({ url, setAttributes, setPopover, popoverAnchor, clientId }) => {
  const { removeBlock } = useDispatch(blockEditorStore);
  return (
    <URLPopover
      anchor={popoverAnchor}
      aria-label={__('Edit icon link')}
      onClose={() => {
        setPopover(false);
        popoverAnchor?.focus();
      }}
    >
      <form
        className="block-editor-url-popover__link-editor"
        onSubmit={(event) => {
          event.preventDefault();
          setPopover(false);
          popoverAnchor?.focus();
        }}
      >
        <div className="block-editor-url-input">
          <URLInput
            value={url}
            onChange={(nextURL) => setAttributes({ url: nextURL })}
            placeholder={__('Enter link')}
            label={__('Enter link')}
            hideLabelFromVision
            disableSuggestions
            onKeyDown={(event) => {
              if (!!url || event.defaultPrevented || ![BACKSPACE, DELETE].includes(event.keyCode)) {
                return;
              }
              removeBlock(clientId);
            }}
            suffix={
              <InputControlSuffixWrapper variant="control">
                <Button icon={'arrow-right-alt2'} label={__('Apply')} type="submit" size="small" />
              </InputControlSuffixWrapper>
            }
          />
        </div>
      </form>
    </URLPopover>
  );
};

export default IconLinkURLPopover;
