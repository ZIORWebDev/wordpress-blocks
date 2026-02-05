const { URLPopover, URLInput, store: blockEditorStore } = wp.blockEditor;
const {
	ToolbarButton,
	__experimentalInputControlSuffixWrapper: InputControlSuffixWrapper,
} = wp.components;
const { __ } = wp.i18n;
const { useDispatch } = wp.data;
const { DELETE, BACKSPACE } = wp.keycodes;

type SetAttributes = (attrs: { iconUrl?: string }) => void;

type IconLinkURLPopoverProps = {
	iconUrl: string;
	setAttributes: SetAttributes;
	setPopover: (open: boolean) => void;
	popoverAnchor: HTMLElement | null;
	clientId: string; // needed by removeBlock(clientId)
};

const IconLinkURLPopover = ({
	iconUrl,
	setAttributes,
	setPopover,
	popoverAnchor,
	clientId,
}: IconLinkURLPopoverProps): JSX.Element => {
	const { removeBlock } = useDispatch(blockEditorStore) as {
		removeBlock: (id: string) => void;
	};

	return (
		<URLPopover
			anchor={popoverAnchor}
			aria-label={__('Edit icon link')}
			onClose={() => setPopover(false)}
		>
			<form
				className="block-editor-url-popover__link-editor"
				onSubmit={(event: React.FormEvent<HTMLFormElement>) => {
					event.preventDefault();
					setPopover(false);
				}}
			>
				<div className="block-editor-url-input">
					<URLInput
						value={iconUrl}
						onChange={(nextURL: string) => setAttributes({ iconUrl: nextURL })}
						placeholder={__('Enter link')}
						label={__('Enter link')}
						hideLabelFromVision
						disableSuggestions
						onKeyDown={(event: React.KeyboardEvent) => {
							const keyCode =
								(event as unknown as { keyCode?: number }).keyCode ?? 0;

							if (
								!!iconUrl ||
								event.defaultPrevented ||
								![BACKSPACE, DELETE].includes(keyCode)
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
