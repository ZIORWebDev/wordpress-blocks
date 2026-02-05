/**
 * External dependencies
 */
import { clsx } from 'clsx';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { useEffect, useCallback, useMemo, Platform } from '@wordpress/element';
import { useDispatch, useSelect } from '@wordpress/data';

import {
	AlignmentControl,
	BlockControls,
	RichText,
	useBlockProps,
	store as blockEditorStore,
	useBlockEditingMode,
	InspectorControls,
} from '@wordpress/block-editor';

import {
	PanelBody,
	SelectControl,
	TextareaControl,
	__experimentalNumberControl as NumberControl,
	__experimentalText as Text,
} from '@wordpress/components';

import apiFetch from '@wordpress/api-fetch';

/**
 * Internal dependencies
 */
import { generateAnchor, setAnchor } from './autogenerate-anchors';
import MetaFieldSelector from '../../components/meta-field-selector';
import TimeFormatControls from '../../components/time-format-controls';

/**
 * Globals typically provided via wp_localize_script / wp_add_inline_script.
 */
declare const ZIORWPBlocks: { restUrl: string };
declare const wpApiSettings: { nonce: string };

/**
 * Infer child component prop types (keeps you aligned with their real typings)
 */
type MetaFieldSelectorProps = React.ComponentProps<typeof MetaFieldSelector>;
type TimeFormatControlsProps = React.ComponentProps<typeof TimeFormatControls>;

type MetaFieldType = MetaFieldSelectorProps['metaFieldType'];
type NonNullMetaFieldType = NonNullable<MetaFieldType>;

/**
 * Types
 */
type TextAlign = 'left' | 'center' | 'right' | 'justify' | undefined;
type TagName = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'div' | 'span';

interface MegaFieldAttributes {
	// allow additional attributes (useful when passing through to other components)
	[key: string]: unknown;

	textAlign?: TextAlign;
	content?: string;
	level?: number;
	placeholder?: string;
	anchor?: string | null;
	tagName?: TagName;

	metaKey?: string;
	metaFieldType?: MetaFieldType;
	fieldProvider?: string;
	postType?: string;

	showMetaSelector?: boolean;

	returnFormat?: string;
	showReturnFormat?: boolean;

	dataIndex?: number;
	showDataIndex?: boolean;

	helpText?: string;

	showTimeControls?: boolean;
	timeFormat?: TimeFormatControlsProps['timeFormat'];
	outputFormat?: TimeFormatControlsProps['outputFormat'];

	showDateControls?: boolean;
	dateFormat?: string;
}

type SetAttributes = (next: Partial<MegaFieldAttributes>) => void;

interface MegaFieldEditProps {
	attributes: MegaFieldAttributes;
	setAttributes: SetAttributes;
	mergeBlocks?: (...args: unknown[]) => void;
	onReplace?: (...args: unknown[]) => void;
	style?: React.CSSProperties;
	clientId: string;
}

/**
 * Narrow unknown values safely into numbers.
 */
const toNumber = (value: unknown, fallback = 0): number => {
	if (typeof value === 'number' && Number.isFinite(value)) return value;
	if (typeof value === 'string' && value.trim() !== '') {
		const n = Number(value);
		return Number.isFinite(n) ? n : fallback;
	}
	return fallback;
};

const isTagName = (value: unknown): value is TagName => {
	return (
		value === 'h1' ||
		value === 'h2' ||
		value === 'h3' ||
		value === 'h4' ||
		value === 'h5' ||
		value === 'h6' ||
		value === 'p' ||
		value === 'div' ||
		value === 'span'
	);
};

/**
 * Minimal selector shape for core/editor (so we don't need @wordpress/editor package)
 */
type CoreEditorSelectors = {
	getCurrentPost?: () => { id?: number } | undefined;
};

type BlockEditorSettings = { generateAnchors?: boolean };

function MegaFieldEdit({
	attributes,
	setAttributes,
	mergeBlocks,
	onReplace,
	style,
	clientId,
}: MegaFieldEditProps) {
	const {
		textAlign,
		content = '',
		level = 2,
		placeholder,
		anchor = null,
		tagName,

		metaKey = '',
		metaFieldType = 'post_meta' as NonNullMetaFieldType,
		fieldProvider = '',
		// keep in attributes even if MetaFieldSelector doesn't accept it
		postType = 'post',
		showMetaSelector = false,

		returnFormat = '',
		showReturnFormat = false,

		dataIndex = 0,
		showDataIndex = false,

		helpText = '',

		showTimeControls = false,
		timeFormat,
		outputFormat,

		showDateControls = false,
		dateFormat = '',
	} = attributes;

	const effectiveTag: TagName = useMemo(() => {
		if (isTagName(tagName)) return tagName;
		const computed = `h${level}` as unknown;
		return isTagName(computed) ? (computed as TagName) : 'h2';
	}, [tagName, level]);

	const blockProps = useBlockProps({
		className: clsx({
			[`has-text-align-${textAlign}`]: !!textAlign,
		}),
		style,
	});

	const blockEditingMode = useBlockEditingMode();

	const { canGenerateAnchors, postId } = useSelect((select) => {
		const be = select(blockEditorStore);
		const settings = (be.getSettings?.() ?? {}) as BlockEditorSettings;
		const tocCount = be.getGlobalBlockCount?.('core/table-of-contents') ?? 0;

		const coreEditor = select('core/editor' as const) as unknown as CoreEditorSelectors;
		const currentPost = coreEditor.getCurrentPost?.();
		const postId = currentPost?.id ?? 0;

		return {
			canGenerateAnchors: Boolean(settings.generateAnchors) || tocCount > 0,
			postId,
		};
	}, []);

	const { __unstableMarkNextChangeAsNotPersistent } = useDispatch(
		blockEditorStore,
	) as { __unstableMarkNextChangeAsNotPersistent?: () => void };

	useEffect(() => {
		if (!canGenerateAnchors) return;

		if (!anchor && content) {
			__unstableMarkNextChangeAsNotPersistent?.();
			setAttributes({ anchor: generateAnchor(clientId, content) });
		}

		setAnchor(clientId, anchor);

		return () => setAnchor(clientId, null);
	}, [
		anchor,
		content,
		clientId,
		canGenerateAnchors,
		__unstableMarkNextChangeAsNotPersistent,
		setAttributes,
	]);

	const onContentChange = useCallback(
		(value: string) => {
			const nextAttrs: Partial<MegaFieldAttributes> = { content: value };

			if (
				canGenerateAnchors &&
				(!anchor || !value || generateAnchor(clientId, content) === anchor)
			) {
				nextAttrs.anchor = generateAnchor(clientId, value);
			}

			setAttributes(nextAttrs);
		},
		[anchor, canGenerateAnchors, clientId, content, setAttributes],
	);

	const queryString = useMemo(() => {
		if (!metaKey) return '';

		const params = new URLSearchParams({
			metaFieldType: String(metaFieldType),
			metaKey,
			postId: String(postId),
			fieldProvider,
		});

		if (showDataIndex) params.set('dataIndex', String(dataIndex));
		if (returnFormat) params.set('returnFormat', returnFormat);
		if (outputFormat) params.set('outputFormat', String(outputFormat));
		if (timeFormat) params.set('timeFormat', String(timeFormat));
		if (dateFormat) params.set('dateFormat', dateFormat);

		// keep postType in the request if you rely on it server-side
		if (postType) params.set('postType', String(postType));

		return params.toString();
	}, [
		metaKey,
		metaFieldType,
		fieldProvider,
		postId,
		showDataIndex,
		dataIndex,
		returnFormat,
		outputFormat,
		timeFormat,
		dateFormat,
		postType,
	]);

	const fetchMetaValue = useCallback(async () => {
		if (!metaKey) return;

		try {
			const path = `${ZIORWPBlocks.restUrl}/${String(
				metaFieldType,
			)}/value/?${queryString}`;

			const response = (await apiFetch({
				path,
				headers: { 'X-WP-Nonce': wpApiSettings.nonce },
			})) as { value?: unknown } | undefined;

			setAttributes({ content: (response?.value as string) ?? '' });
		} catch {
			setAttributes({ content: '' });
		}
	}, [metaKey, metaFieldType, queryString, setAttributes]);

	useEffect(() => {
		if (!metaKey) return;
		void fetchMetaValue();
	}, [metaKey, fetchMetaValue]);

	return (
		<>
			{blockEditingMode === 'default' && (
				<BlockControls group="block">
					<AlignmentControl
						value={textAlign}
						onChange={(nextAlign: TextAlign) =>
							setAttributes({ textAlign: nextAlign })
						}
					/>
				</BlockControls>
			)}

			<InspectorControls>
				<PanelBody title={__('Settings')} initialOpen>
					{helpText ? (
						<Text
							variant="muted"
							style={{ marginBottom: 12, display: 'block', fontSize: 12 }}
						>
							{helpText}
						</Text>
					) : null}

					{showMetaSelector ? (
						<MetaFieldSelector
							value={metaKey}
							metaFieldType={metaFieldType}
							onChange={(next: string) => setAttributes({ metaKey: next })}
							onTypeChange={(nextType: NonNullMetaFieldType) =>
								setAttributes({ metaFieldType: nextType })
							}
							attributes={attributes as unknown as MetaFieldSelectorProps['attributes']}
							setAttributes={setAttributes as unknown as MetaFieldSelectorProps['setAttributes']}
						/>
					) : null}

					{showReturnFormat ? (
						<TextareaControl
							label={__('Template Tokens')}
							help={__('Define the output format using dynamic tokens.')}
							value={returnFormat}
							onChange={(value: string) => setAttributes({ returnFormat: value })}
							placeholder="{field_key}"
						/>
					) : null}

					{showDataIndex ? (
						<NumberControl
							label={__('Data Index')}
							help={__('Enter the index of the data for array-type meta fields')}
							value={dataIndex}
							onChange={(nextValue?: string) =>
								setAttributes({ dataIndex: toNumber(nextValue, 0) })
							}
							placeholder="0"
						/>
					) : null}

					{showTimeControls ? (
						<TimeFormatControls
							timeFormat={timeFormat}
							outputFormat={outputFormat}
							showDateControls={showDateControls}
							dateFormat={dateFormat}
							onChange={setAttributes as unknown as TimeFormatControlsProps['onChange']}
						/>
					) : null}

					<SelectControl<TagName>
						label={__('HTML tag')}
						value={effectiveTag}
						options={[
							{ label: 'H1', value: 'h1' },
							{ label: 'H2', value: 'h2' },
							{ label: 'H3', value: 'h3' },
							{ label: 'H4', value: 'h4' },
							{ label: 'H5', value: 'h5' },
							{ label: 'H6', value: 'h6' },
							{ label: 'Paragraph', value: 'p' },
							{ label: 'Div', value: 'div' },
							{ label: 'Span', value: 'span' },
						]}
						onChange={(selected?: TagName) => {
							if (!selected) return;

							if (selected.startsWith('h')) {
								const parsed = Number.parseInt(selected.slice(1), 10);
								const nextLevel = Number.isNaN(parsed) ? level : parsed;

								setAttributes({
									level: nextLevel,
									tagName: `h${nextLevel}` as TagName,
								});
							} else {
								setAttributes({ tagName: selected });
							}
						}}
					/>
				</PanelBody>
			</InspectorControls>

			<RichText
				identifier="content"
				tagName={effectiveTag}
				value={content}
				onChange={onContentChange}
				onMerge={mergeBlocks as any}
				onReplace={onReplace as any}
				onRemove={() => onReplace?.([])}
				placeholder={placeholder || __('Meta Field')}
				// RichText typings in newer WP don't include `textAlign`; alignment is handled via className.
				{...(!Platform.isWeb ? { deleteEnter: true } : undefined)}
				{...blockProps}
			/>
		</>
	);
}

export default MegaFieldEdit;
