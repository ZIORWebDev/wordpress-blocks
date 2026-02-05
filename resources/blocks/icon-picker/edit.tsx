/**
 * External dependencies
 */
import { clsx } from 'clsx';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { useEffect, useRef, useState } from '@wordpress/element';
import {
	BlockControls,
	ContrastChecker,
	InspectorControls,
	useBlockProps,
	useInnerBlocksProps,
	withColors,
} from '@wordpress/block-editor';
import {
	SelectControl,
	ToggleControl,
	ToolbarButton,
	__experimentalToolsPanel as ToolsPanel,
	__experimentalToolsPanelItem as ToolsPanelItem,
} from '@wordpress/components';
import type { BlockEditProps } from '@wordpress/blocks';

/**
 * Experimental block-editor APIs
 * Feature-detected because availability depends on WP/Gutenberg version.
 */
const useMultipleOriginColorsAndGradients:
	| undefined
	| ((...args: any[]) => any) =
	wp.blockEditor?.__experimentalUseMultipleOriginColorsAndGradients;

const ColorGradientSettingsDropdown:
	| undefined
	| React.ComponentType<any> =
	wp.blockEditor?.__experimentalColorGradientSettingsDropdown;

/**
 * Internal dependencies
 */
import { useToolsPanelDropdownMenuProps } from '../../utils/hooks';
import IconInserter from '../../components/icon-inserter';
import { useReplaceIconOnInsert } from '../../utils/replace-insert';
import IconLinkURLPopover from '../../components/icon-link-url';

type IconPickerAttributes = {
	className?: string;

	iconBackgroundColorValue?: string;
	iconColorValue?: string;

	openInNewTab?: boolean;
	showLabels?: boolean;
	size?: string;

	iconUrl?: string;
};

type WPColorObject = {
	color?: string;
	slug?: string;
	class?: string;
};

type WithColorsInjectedProps = {
	iconBackgroundColor: WPColorObject;
	iconColor: WPColorObject;
	setIconBackgroundColor: ( color?: string ) => void;
	setIconColor: ( color?: string ) => void;
};

type Props = BlockEditProps< IconPickerAttributes > & WithColorsInjectedProps;

const sizeOptions: Array<{ label: string; value: string }> = [
	{ label: __( 'Default' ), value: '' },
	{ label: __( 'Small' ), value: 'has-small-icon-size' },
	{ label: __( 'Normal' ), value: 'has-normal-icon-size' },
	{ label: __( 'Large' ), value: 'has-large-icon-size' },
	{ label: __( 'Huge' ), value: 'has-huge-icon-size' },
];

export function IconPickerEdit( props: Props ) {
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

	const logosOnly = attributes.className?.includes( 'is-style-logos-only' ) ?? false;
	const dropdownMenuProps = useToolsPanelDropdownMenuProps();

	const [ showURLPopover, setPopover ] = useState( false );
	const popoverAnchor = useRef< HTMLElement | null >( null );

	// Store background color values to restore them when leaving "logos only".
	const restoreBgRef = useRef<
		Pick<
			IconPickerAttributes,
			'iconBackgroundColorValue'
		> & { iconBackgroundColor?: unknown; customIconBackgroundColor?: unknown }
	>( {} );

	// Remove icon background color when logos only style is selected or restore it otherwise.
	useEffect( () => {
		if ( ! logosOnly ) {
			// restore when switching away from logosOnly
			const restore = restoreBgRef.current;
			if (
				restore &&
				( restore.iconBackgroundColorValue !== undefined ||
					restore.iconBackgroundColor !== undefined ||
					restore.customIconBackgroundColor !== undefined )
			) {
				setAttributes( {
					// These extra keys may exist in block.json even if not typed here.
					// Keep them for backward compatibility.
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					...( restore as any ),
				} );
			}
			return;
		}

		// capture current values once when entering logosOnly
		restoreBgRef.current = {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			iconBackgroundColor: ( attributes as any ).iconBackgroundColor,
			iconBackgroundColorValue: attributes.iconBackgroundColorValue,
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			customIconBackgroundColor: ( attributes as any ).customIconBackgroundColor,
		};

		setAttributes( {
			iconBackgroundColorValue: undefined,
		} );
	}, [ logosOnly, setAttributes ] ); // intentionally not depending on attributes to avoid loops

	// Fallback values preserve selection when switching themes/palettes.
	const className = clsx( size, {
		'has-visible-labels': !! showLabels,
		'has-icon-color': !! iconColor.color || !! iconColorValue,
		'has-icon-background-color':
			!! iconBackgroundColor.color || !! iconBackgroundColorValue,
	} );

	const blockProps = useBlockProps( { className } );
	useReplaceIconOnInsert( clientId );

	const innerBlocksProps = useInnerBlocksProps( blockProps, {
		template: [ [ 'zior/icon', { service: 'wordpress', url: '' } ] ],
		renderAppender: () => null,
	} );

	const colorSettings: Array<{
		value?: string;
		onChange: ( colorValue?: string ) => void;
		label: string;
		resetAllFilter: () => void;
	}> = [
		{
			value: iconColor.color || iconColorValue,
			onChange: ( colorValue?: string ) => {
				setIconColor( colorValue );
				setAttributes( { iconColorValue: colorValue } );
			},
			label: __( 'Icon color' ),
			resetAllFilter: () => {
				setIconColor( undefined );
				setAttributes( { iconColorValue: undefined } );
			},
		},
	];

	if ( ! logosOnly ) {
		colorSettings.push( {
			value: iconBackgroundColor.color || iconBackgroundColorValue,
			onChange: ( colorValue?: string ) => {
				setIconBackgroundColor( colorValue );
				setAttributes( { iconBackgroundColorValue: colorValue } );
			},
			label: __( 'Icon background' ),
			resetAllFilter: () => {
				setIconBackgroundColor( undefined );
				setAttributes( { iconBackgroundColorValue: undefined } );
			},
		} );
	}

	const colorGradientSettings = useMultipleOriginColorsAndGradients();

	return (
		<>
			<BlockControls>
				<IconInserter rootClientId={ clientId } label="Change Icon" />
				<ToolbarButton
					icon="admin-links"
					label={ __( 'Edit link' ) }
					onClick={ ( event ) => {
						setPopover( ( prev ) => ! prev );
						popoverAnchor.current = event.currentTarget as HTMLElement;
					} }
				/>
			</BlockControls>

			<InspectorControls>
				<ToolsPanel
					label={ __( 'Settings' ) }
					resetAll={ () => {
						setAttributes( {
							openInNewTab: false,
							showLabels: false,
							size: undefined,
						} );
					} }
					dropdownMenuProps={ dropdownMenuProps }
				>
					<ToolsPanelItem
						isShownByDefault
						hasValue={ () => !! size }
						label={ __( 'Icon size' ) }
						onDeselect={ () => setAttributes( { size: undefined } ) }
					>
						<SelectControl
							__next40pxDefaultSize
							__nextHasNoMarginBottom
							label={ __( 'Icon size' ) }
							onChange={ ( newSize?: string ) => {
								setAttributes( {
									size: newSize && newSize !== '' ? newSize : undefined,
								} );
							} }
							value={ size ?? '' }
							options={ sizeOptions }
						/>
					</ToolsPanelItem>

					<ToolsPanelItem
						isShownByDefault
						label={ __( 'Show text' ) }
						hasValue={ () => !! showLabels }
						onDeselect={ () => setAttributes( { showLabels: false } ) }
					>
						<ToggleControl
							__nextHasNoMarginBottom
							label={ __( 'Show text' ) }
							checked={ !! showLabels }
							onChange={ () => setAttributes( { showLabels: ! showLabels } ) }
						/>
					</ToolsPanelItem>

					<ToolsPanelItem
						isShownByDefault
						label={ __( 'Open links in new tab' ) }
						hasValue={ () => !! openInNewTab }
						onDeselect={ () => setAttributes( { openInNewTab: false } ) }
					>
						<ToggleControl
							__nextHasNoMarginBottom
							label={ __( 'Open links in new tab' ) }
							checked={ !! openInNewTab }
							onChange={ () =>
								setAttributes( { openInNewTab: ! openInNewTab } )
							}
						/>
					</ToolsPanelItem>
				</ToolsPanel>
			</InspectorControls>

			{ colorGradientSettings.hasColorsOrGradients && (
				<InspectorControls group="color">
					{ colorSettings.map( ( { onChange, label, value, resetAllFilter } ) => (
						<ColorGradientSettingsDropdown
							key={ `icon-picker-color-${ label }` }
							__experimentalIsRenderedInSidebar
							settings={ [
								{
									colorValue: value,
									label,
									onColorChange: onChange,
									isShownByDefault: true,
									resetAllFilter,
									enableAlpha: true,
									clearable: true,
								},
							] }
							panelId={ clientId }
							{ ...colorGradientSettings }
						/>
					) ) }

					{ ! logosOnly && (
						<ContrastChecker
							{ ...( {
								textColor: iconColorValue,
								backgroundColor: iconBackgroundColorValue,
							} as unknown as Record< string, unknown > ) }
							isLargeText={ false }
						/>
					) }
				</InspectorControls>
			) }

			{/* URL popover */}
			{ showURLPopover && (
				<IconLinkURLPopover
				iconUrl={ iconUrl ?? '' }
				setAttributes={ setAttributes }
				setPopover={ setPopover }
				popoverAnchor={ popoverAnchor.current }
				clientId={ clientId }
				/>

			) }

			<span { ...innerBlocksProps } />
		</>
	);
}

const iconColorAttributes = {
	iconColor: 'icon-color',
	iconBackgroundColor: 'icon-background-color',
} as const;

// withColors() typings are loose; we assert a safe component type for strict TS.
export default withColors( iconColorAttributes )(
	IconPickerEdit,
) as unknown as ( props: BlockEditProps< IconPickerAttributes > ) => JSX.Element;
