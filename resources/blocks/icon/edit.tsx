/**
 * External dependencies
 */
import { clsx } from 'clsx';

/**
 * WordPress dependencies
 */
import type { BlockEditProps, BlockVariation } from '@wordpress/blocks';
import { store as blocksStore } from '@wordpress/blocks';
import {
	InspectorControls,
	useBlockProps,
	type BlockContext,
} from '@wordpress/block-editor';
import {
	ExternalLink,
	Icon,
	TextControl,
	// eslint-disable-next-line @typescript-eslint/naming-convention
	__experimentalToolsPanel as ToolsPanel,
	// eslint-disable-next-line @typescript-eslint/naming-convention
	__experimentalToolsPanelItem as ToolsPanelItem,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useDispatch, useSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { getIconService } from './icon-list';
import { useToolsPanelDropdownMenuProps } from '../../utils/hooks';

type Attributes = {
	url?: string;
	service?: string;
	label?: string;
	rel?: string;
};

type Context = {
	showLabels?: boolean;
	iconColor?: string;
	iconColorValue?: string;
	iconBackgroundColor?: string;
	iconBackgroundColorValue?: string;
};

type IconServiceResult = {
	icon: unknown;
	label: string;
};

type Props = BlockEditProps<Attributes> & {
	context: BlockContext & Context;
};

export default function IconEdit(props: Props) {
	const { attributes, context, setAttributes, name, clientId } = props;
	const { url, service = '', label = '', rel } = attributes;

	const dropdownMenuProps = useToolsPanelDropdownMenuProps();

	const {
		showLabels,
		iconColor,
		iconColorValue,
		iconBackgroundColor,
		iconBackgroundColorValue,
	} = context ?? {};

	const { activeVariation } = useSelect(
		(select) => {
			const { getActiveBlockVariation } = select(blocksStore) as {
				getActiveBlockVariation: (
					blockName: string,
					attrs: Record<string, unknown>
				) => BlockVariation | undefined;
			};

			return { activeVariation: getActiveBlockVariation(name, attributes) };
		},
		[name, attributes]
	);

	const { icon, label: iconLinkName } = getIconService(
		activeVariation
	) as IconServiceResult;

	const iconLinkText = label.trim() === '' ? iconLinkName : label;

	const parentClientId = useSelect(
		(select) =>
			select('core/block-editor').getBlockRootClientId(clientId) as
				| string
				| undefined,
		[clientId]
	);

	const { selectBlock } = useDispatch('core/block-editor') as {
		selectBlock: (id: string) => void;
	};

	const wrapperClasses = clsx(
		'wp-zior-icon',
		'wp-block-zior-icon',
		`wp-zior-icon-${service}`,
		{
			'wp-zior-icon__is-incomplete': !url,
			[`has-${iconColor}-color`]: !!iconColor,
			[`has-${iconBackgroundColor}-background-color`]: !!iconBackgroundColor,
		}
	);

	const blockProps = useBlockProps({
		className: 'wp-block-zior-icon-anchor',
		onClick: (e: React.MouseEvent) => {
			e.stopPropagation(); // prevent selecting the child
			if (parentClientId) selectBlock(parentClientId); // select parent block
		},
	});

	return (
		<>
			<InspectorControls>
				<ToolsPanel
					label={__('Settings', 'wordpress-blocks')}
					resetAll={() => setAttributes({ label: undefined })}
					dropdownMenuProps={dropdownMenuProps}
				>
					<ToolsPanelItem
						isShownByDefault
						label={__('Text', 'wordpress-blocks')}
						hasValue={() => !!label}
						onDeselect={() => setAttributes({ label: undefined })}
					>
						<TextControl
							__next40pxDefaultSize
							__nextHasNoMarginBottom
							label={__('Text', 'wordpress-blocks')}
							help={__(
								'The text is visible when enabled from the parent Icon Picker block.',
								'wordpress-blocks'
							)}
							value={label}
							onChange={(value: string) => setAttributes({ label: value })}
							placeholder={iconLinkName}
						/>
					</ToolsPanelItem>
				</ToolsPanel>

				<InspectorControls group="advanced">
					<TextControl
						__next40pxDefaultSize
						__nextHasNoMarginBottom
						label={__('Link relation', 'wordpress-blocks')}
						help={
							<ExternalLink href="https://developer.mozilla.org/docs/Web/HTML/Attributes/rel">
								{__(
									'The <a>Link Relation</a> attribute defines the relationship between a linked resource and the current document.',
									'wordpress-blocks'
								)}
							</ExternalLink>
						}
						value={rel || ''}
						onChange={(value: string) => setAttributes({ rel: value })}
					/>
				</InspectorControls>
			</InspectorControls>

			<span
				role="presentation"
				className={wrapperClasses}
				style={{
					color: iconColorValue,
					backgroundColor: iconBackgroundColorValue,
				}}
			>
				<button {...blockProps} role="button">
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
