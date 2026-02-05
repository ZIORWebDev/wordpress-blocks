import { clsx } from 'clsx';
import { __ } from '@wordpress/i18n';
import { store as blocksStore, type BlockVariation } from '@wordpress/blocks';
import { useSelect, useDispatch } from '@wordpress/data';
import {
	useBlockProps,
	InspectorControls,
	store as blockEditorStore,
} from '@wordpress/block-editor';
import {
	TextControl,
	ExternalLink,
	__experimentalToolsPanel as ToolsPanel,
	__experimentalToolsPanelItem as ToolsPanelItem,
	Icon,
	DropdownMenu,
} from '@wordpress/components';

import { getIconService } from './icon-list';
import { useToolsPanelDropdownMenuProps } from '../../utils/hooks';
import type { Attributes } from './index';

type IconBlockAttributes = {
	url?: string;
	service?: string;
	label?: string;
	rel?: string;
};

type IconBlockContext = {
	showLabels?: boolean;
	iconColor?: string;
	iconColorValue?: string;
	iconBackgroundColor?: string;
	iconBackgroundColorValue?: string;
};

type Props = {
	attributes: IconBlockAttributes;
	context: IconBlockContext;
	setAttributes: (next: Partial<IconBlockAttributes>) => void;
	name: string;
	clientId: string;
};

type BlocksSelectors = {
	getActiveBlockVariation: (
		blockName: string,
		attrs: IconBlockAttributes
	) => BlockVariation | undefined;
};

type BlockEditorSelectors = {
	getBlockRootClientId: (clientId: string) => string | null;
};

// Derive the prop type from the actual exported component (DropdownMenuProps is not exported).
type DropdownMenuProps = React.ComponentProps<typeof DropdownMenu>;

export default function Edit(props: BlockEditProps<Attributes>) {
  const { attributes, setAttributes, clientId, context } = props;
	const { url, service, label = '', rel } = attributes;

	const {
		showLabels,
		iconColor,
		iconColorValue,
		iconBackgroundColor,
		iconBackgroundColorValue,
	} = context;

	// ToolsPanel expects DropdownMenu props; `label` is required.
	const dropdownMenuPropsFromHook =
		useToolsPanelDropdownMenuProps() as Partial<DropdownMenuProps>;

	const dropdownMenuProps = {
		label: __('Tools panel options'),
		...dropdownMenuPropsFromHook,
	} as DropdownMenuProps;

	const { activeVariation } = useSelect(
		(select) => {
			const { getActiveBlockVariation } = select(blocksStore) as BlocksSelectors;
			return { activeVariation: getActiveBlockVariation(name, attributes) };
		},
		// Avoid using the whole attributes object as a dep (object identity changes often).
		[name, url, service, label, rel]
	);

	const { icon, label: iconLinkName } = getIconService(activeVariation);
	const iconLinkText = label.trim() === '' ? iconLinkName : label;

	const parentClientId = useSelect(
		(select) => {
			const editor = select(blockEditorStore) as BlockEditorSelectors;
			return editor.getBlockRootClientId(clientId);
		},
		[clientId]
	);

	// WP data dispatch typing is generic/promisified; bridge intentionally through `unknown`.
	const { selectBlock } = useDispatch('core/block-editor') as unknown as {
		selectBlock: (id: string) => void;
	};

	const wrapperClasses = clsx(
		'wp-zior-icon',
		'wp-block-zior-icon',
		service ? `wp-zior-icon-${service}` : null,
		{
			'wp-zior-icon__is-incomplete': !url,
			[`has-${iconColor}-color`]: !!iconColor,
			[`has-${iconBackgroundColor}-background-color`]: !!iconBackgroundColor,
		}
	);

	const blockProps = useBlockProps({
		className: 'wp-block-zior-icon-anchor',
		onClick: (e: React.MouseEvent<HTMLElement>) => {
			e.stopPropagation();
			if (parentClientId) selectBlock(parentClientId);
		},
	});

	return (
		<>
			{/* Main controls */}
			<InspectorControls>
				<ToolsPanel
					label={__('Settings')}
					resetAll={() => setAttributes({ label: undefined })}
					dropdownMenuProps={dropdownMenuProps}
				>
					<ToolsPanelItem
						isShownByDefault
						label={__('Text')}
						hasValue={() => !!label}
						onDeselect={() => setAttributes({ label: undefined })}
					>
						<TextControl
							__next40pxDefaultSize
							label={__('Text')}
							help={__(
								'The text is visible when enabled from the parent Icon Picker block.'
							)}
							value={label}
							onChange={(value: string) => setAttributes({ label: value })}
							placeholder={iconLinkName}
						/>
					</ToolsPanelItem>
				</ToolsPanel>
			</InspectorControls>

			{/* Advanced controls (do not nest InspectorControls) */}
			<InspectorControls group="advanced">
				<TextControl
					__next40pxDefaultSize
					label={__('Link relation')}
					help={
						<ExternalLink href="https://developer.mozilla.org/docs/Web/HTML/Attributes/rel">
							{__(
								'The <a>Link Relation</a> attribute defines the relationship between a linked resource and the current document.'
							)}
						</ExternalLink>
					}
					value={rel ?? ''}
					onChange={(value: string) => setAttributes({ rel: value })}
				/>
			</InspectorControls>

			<span
				role="presentation"
				className={wrapperClasses}
				style={{
					color: iconColorValue,
					backgroundColor: iconBackgroundColorValue,
				}}
			>
				<button {...blockProps} type="button">
					<Icon icon={icon} />
					<span
						className={clsx('wp-block-zior-icon-label', {
							'screen-reader-text': !showLabels,
						})}
					>
						{iconLinkText}
					</span>
				</button>
			</span>
		</>
	);
}
