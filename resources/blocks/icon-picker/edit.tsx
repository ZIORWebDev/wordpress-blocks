/**
 * External dependencies
 */
import clsx from 'clsx';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { useEffect, useMemo, useRef, useState } from '@wordpress/element';
import {
	BlockControls,
	ContrastChecker,
	InspectorControls,
	useBlockProps,
	useInnerBlocksProps,
	withColors,
	// Experimental (availability depends on WP/Gutenberg version)
	__experimentalColorGradientSettingsDropdown as ColorGradientSettingsDropdown,
	__experimentalUseMultipleOriginColorsAndGradients as useMultipleOriginColorsAndGradients,
} from '@wordpress/block-editor';
import { SelectControl, ToggleControl, ToolbarButton } from '@wordpress/components';
import {
	// Experimental
	__experimentalToolsPanel as ToolsPanel,
	__experimentalToolsPanelItem as ToolsPanelItem,
} from '@wordpress/components';
import type { BlockEditProps, InnerBlockTemplate } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import { useToolsPanelDropdownMenuProps } from '../../utils/hooks';
import IconInserter from '../../components/icon-inserter';
import { useReplaceIconOnInsert } from '../../utils/replace-insert';
import IconLinkURLPopover from '../../components/icon-link-url';

type Attributes = {
	className?: string;

	// Color fallback attrs (used to preserve selection across theme palette changes)
	iconColorValue?: string;
	iconBackgroundColorValue?: string;

	// Link + UI options
	openInNewTab?: boolean;
	showLabels?: boolean;
	size?: string;

	// URL used by the icon link popover
	iconUrl?: string;

	// These may exist depending on how your block stores color state
	iconBackgroundColor?: string;
	customIconBackgroundColor?: string;
};

type WpColor = {
	color?: string;
	// other fields exist (slug, name, class), but not required for this component
};

type Props = BlockEditProps<Attributes> & {
	iconBackgroundColor: WpColor;
	iconColor: WpColor;
	setIconBackgroundColor: (value?: string) => void;
	setIconColor: (value?: string) => void;
};

const SIZE_OPTIONS = [
	{ label: __('Default'), value: '' },
	{ label: __('Small'), value: 'has-small-icon-size' },
	{ label: __('Normal'), value: 'has-normal-icon-size' },
	{ label: __('Large'), value: 'has-large-icon-size' },
	{ label: __('Huge'), value: 'has-huge-icon-size' },
] as const;

const TEMPLATE: InnerBlockTemplate[] = [
	[ 'zior/icon', { service: 'wordpress', url: '' } as Record<string, unknown> ],
];

export function IconPickerEdit(props: Props) {
	const {
		clientId,
		attributes,
		iconBackgroundColor,
		iconColor,
		setAttributes,
		setIconBackgroundColor,
		setIconColor,
	} = props;

	const {
		iconBackgroundColorValue,
		iconColorValue,
		openInNewTab = false,
		showLabels = false,
		size,
		iconUrl,
	} = attributes;

	const logosOnly = !!attributes.className?.includes('is-style-logos-only');
	const dropdownMenuProps = useToolsPanelDropdownMenuProps();

	const [showURLPopover, setPopover] = useState<boolean>(false);
	const popoverAnchor = useRef<HTMLElement | null>(null);

	// Store/restore background color-related attrs when switching to "logos only" style.
	const restoreBgRef = useRef<Pick<
		Attributes,
		'iconBackgroundColor' | 'iconBackgroundColorValue' | 'customIconBackgroundColor'
	> | null>(null);

	useEffect(() => {
		if (!logosOnly) return;

		// Capture current values once when entering logosOnly
		restoreBgRef.current = {
			iconBackgroundColor: attributes.iconBackgroundColor,
			iconBackgroundColorValue: attributes.iconBackgroundColorValue,
			customIconBackgroundColor: attributes.customIconBackgroundColor,
		};

		// Clear background color attrs while in logosOnly
		setAttributes({
			iconBackgroundColor: undefined,
			iconBackgroundColorValue: undefined,
			customIconBackgroundColor: undefined,
		});

		// Restore when leaving logosOnly / unmounting
		return () => {
			if (restoreBgRef.current) {
				setAttributes({ ...restoreBgRef.current });
				restoreBgRef.current = null;
			}
		};
		// Intentionally depend on logosOnly only; we want a clean enter/exit effect.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [logosOnly]);

	// Fallback color values are used to maintain selections in case switching themes
	// and named colors in palette do not match.
	const className = useMemo(
		() =>
			clsx(size, {
				'has-visible-labels': showLabels,
				'has-icon-color': !!(iconColor.color || iconColorValue),
				'has-icon-background-color': !!(
					iconBackgroundColor.color || iconBackgroundColorValue
				),
			}),
		[
			size,
			showLabels,
			iconColor.color,
			iconColorValue,
			iconBackgroundColor.color,
			iconBackgroundColorValue,
		]
	);

	const blockProps = useBlockProps({ className });

	useReplaceIconOnInsert(clientId);

	const innerBlocksProps = useInnerBlocksProps(blockProps, {
		template: TEMPLATE,
		renderAppender: undefined,
	});

	const colorSettings = useMemo(() => {
		const settings: Array<{
			value: string | undefined;
			onChange: (colorValue?: string) => void;
			label: string;
			resetAllFilter: () => void;
		}> = [
			{
				value: iconColor.color || iconColorValue,
				onChange: (colorValue?: string) => {
					setIconColor(colorValue);
					setAttributes({ iconColorValue: colorValue });
				},
				label: __('Icon color'),
				resetAllFilter: () => {
					setIconColor(undefined);
					setAttributes({ iconColorValue: undefined });
				},
			},
		];

		if (!logosOnly) {
			settings.push({
				value: iconBackgroundColor.color || iconBackgroundColorValue,
				onChange: (colorValue?: string) => {
					setIconBackgroundColor(colorValue);
					setAttributes({ iconBackgroundColorValue: colorValue });
				},
				label: __('Icon background'),
				resetAllFilter: () => {
					setIconBackgroundColor(undefined);
					setAttributes({ iconBackgroundColorValue: undefined });
				},
			});
		}

		return settings;
	}, [
		iconColor.color,
		iconColorValue,
		setIconColor,
		setAttributes,
		logosOnly,
		iconBackgroundColor.color,
		iconBackgroundColorValue,
		setIconBackgroundColor,
	]);

	// The experimental hook returns a bag of props used by the dropdown.
	// Typings vary by WP version, so keep it flexible.
	const colorGradientSettings = useMultipleOriginColorsAndGradients() as any;

	return (
		<>
			<BlockControls>
				<IconInserter rootClientId={clientId} label="Change Icon" />
				<ToolbarButton
					icon="admin-links"
					label={__('Edit link')}
					onClick={(event) => {
						setPopover((prev) => !prev);
						popoverAnchor.current = event.currentTarget as HTMLElement;
					}}
				/>
			</BlockControls>

			<InspectorControls>
				<ToolsPanel
					label={__('Settings')}
					resetAll={() => {
						setAttributes({
							openInNewTab: false,
							showLabels: false,
							size: undefined,
						});
					}}
					dropdownMenuProps={dropdownMenuProps}
				>
					<ToolsPanelItem
						isShownByDefault
						hasValue={() => !!size}
						label={__('Icon size')}
						onDeselect={() => setAttributes({ size: undefined })}
					>
						<SelectControl
							__next40pxDefaultSize
							__nextHasNoMarginBottom
							label={__('Icon size')}
							onChange={(newSize) =>
								setAttributes({
									size: newSize === '' ? undefined : newSize,
								})
							}
							value={size ?? ''}
							options={SIZE_OPTIONS as unknown as Array<{ label: string; value: string }>}
						/>
					</ToolsPanelItem>

					<ToolsPanelItem
						isShownByDefault
						label={__('Show text')}
						hasValue={() => !!showLabels}
						onDeselect={() => setAttributes({ showLabels: false })}
					>
						<ToggleControl
							__nextHasNoMarginBottom
							label={__('Show text')}
							checked={showLabels}
							onChange={() => setAttributes({ showLabels: !showLabels })}
						/>
					</ToolsPanelItem>

					<ToolsPanelItem
						isShownByDefault
						label={__('Open links in new tab')}
						hasValue={() => !!openInNewTab}
						onDeselect={() => setAttributes({ openInNewTab: false })}
					>
						<ToggleControl
							__nextHasNoMarginBottom
							label={__('Open links in new tab')}
							checked={openInNewTab}
							onChange={() => setAttributes({ openInNewTab: !openInNewTab })}
						/>
					</ToolsPanelItem>
				</ToolsPanel>
			</InspectorControls>

			{!!colorGradientSettings?.hasColorsOrGradients && (
				<InspectorControls group="color">
					{colorSettings.map(({ onChange, label, value, resetAllFilter }) => (
						<ColorGradientSettingsDropdown
							key={`icon-picker-color-${label}`}
							__experimentalIsRenderedInSidebar
							settings={[
								{
									colorValue: value,
									label,
									onColorChange: onChange,
									isShownByDefault: true,
									resetAllFilter,
									enableAlpha: true,
									clearable: true,
								},
							]}
							panelId={clientId}
							{...colorGradientSettings}
						/>
					))}

					{!logosOnly && (
						<ContrastChecker
							{...{
								textColor: iconColorValue,
								backgroundColor: iconBackgroundColorValue,
							}}
							isLargeText={false}
						/>
					)}
				</InspectorControls>
			)}

			{/* URL popover */}
			{showURLPopover && (
				<IconLinkURLPopover
					iconUrl={iconUrl}
					setAttributes={setAttributes}
					setPopover={setPopover}
					popoverAnchor={popoverAnchor.current}
					clientId={clientId}
				/>
			)}

			<span {...innerBlocksProps} />
		</>
	);
}

const iconColorAttributes = {
	iconColor: 'icon-color',
	iconBackgroundColor: 'icon-background-color',
} as const;

export default withColors(iconColorAttributes)(IconPickerEdit);
