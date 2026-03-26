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
import metadata from '../../../src/Blocks/MetaField/block.json';

/**
 * Globals
 */
declare const ZIORWPBlocks: { restUrl: string };
declare const wpApiSettings: { nonce: string };

type MetaFieldSelectorProps = React.ComponentProps<typeof MetaFieldSelector>;
type TimeFormatControlsProps = React.ComponentProps<typeof TimeFormatControls>;

type MetaFieldType = MetaFieldSelectorProps['metaFieldType'];
type NonNullMetaFieldType = NonNullable<MetaFieldType>;
type TextAlign = 'left' | 'center' | 'right' | 'justify' | undefined;
type TagName = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'div' | 'span';

interface MetaFieldAttributes {
	[key: string]: unknown;

	textAlign?: TextAlign;
	content?: string;
	metaValue?: string;
	placeholder?: string;
	anchor?: string | null;
	tagName?: TagName;

	postType?: string;
	metaKey?: string;
	metaFieldType?: MetaFieldType;
	fieldProvider?: string;
	showMetaSelector?: boolean;

	returnFormat?: string;
	showReturnFormat?: boolean;

	dataIndex?: number;
	showDataIndex?: boolean;

	helpText?: string;

	showTimeControls?: boolean;
	timeFormat?: TimeFormatControlsProps['timeFormat'];
	outputFormat?: TimeFormatControlsProps['outputFormat'];

	saveContent?: boolean;

	showDateControls?: boolean;
	dateFormat?: string;
}

type SetAttributes = (next: Partial<MetaFieldAttributes>) => void;

interface MetaFieldEditProps {
	attributes: MetaFieldAttributes;
	setAttributes: SetAttributes;
	mergeBlocks?: (...args: unknown[]) => void;
	onReplace?: (...args: unknown[]) => void;
	style?: React.CSSProperties;
	clientId: string;
}

type CoreEditorSelectors = {
	getCurrentPost?: () => { id?: number } | undefined;
};

type BlockEditorSettings = {
	generateAnchors?: boolean;
};

const toNumber = (value: unknown, fallback = 0): number => {
	if (typeof value === 'number' && Number.isFinite(value)) {
		return value;
	}

	if (typeof value === 'string' && value.trim() !== '') {
		const parsed = Number(value);
		return Number.isFinite(parsed) ? parsed : fallback;
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

function MetaFieldEdit({
	attributes,
	setAttributes,
	mergeBlocks,
	onReplace,
	style,
	clientId,
}: MetaFieldEditProps) {
	const {
		textAlign,
		content = '',
		metaValue = '',
		placeholder,
		anchor = null,
		tagName = 'h2',

		postType = 'page',
		metaKey = '',
		metaFieldType = 'post_meta' as NonNullMetaFieldType,
		fieldProvider = '',
		showMetaSelector = true,

		returnFormat = '',
		showReturnFormat = false,

		dataIndex = 0,
		showDataIndex = false,

		helpText = '',

		showTimeControls = false,
		timeFormat = 'g:i a',
		outputFormat = 'summarized',

		saveContent = true,

		showDateControls = false,
		dateFormat = 'F d, Y',
	} = attributes;

	const editorValue = metaValue || content || '';

	const tagOptions = useMemo(() => {
		const enumValues = metadata.attributes.tagName.enum as string[];

		return enumValues.map((value) => ({
			label: value.toUpperCase(),
			value,
		}));
	}, []);

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

		return {
			canGenerateAnchors: Boolean(settings.generateAnchors) || tocCount > 0,
			postId: currentPost?.id ?? 0,
		};
	}, []);

	const { __unstableMarkNextChangeAsNotPersistent } = useDispatch(
		blockEditorStore
	) as {
		__unstableMarkNextChangeAsNotPersistent?: () => void;
	};

	useEffect(() => {
		if (!canGenerateAnchors) {
			return;
		}

		if (!anchor && editorValue) {
			__unstableMarkNextChangeAsNotPersistent?.();
			setAttributes({
				anchor: generateAnchor(clientId, editorValue),
			});
		}

		setAnchor(clientId, anchor);

		return () => {
			setAnchor(clientId, null);
		};
	}, [
		anchor,
		editorValue,
		clientId,
		canGenerateAnchors,
		__unstableMarkNextChangeAsNotPersistent,
		setAttributes,
	]);

	const onContentChange = useCallback(
		(value: string) => {
			const nextAttributes: Partial<MetaFieldAttributes> = {
				content: value,
				metaValue: value,
			};

			if (
				canGenerateAnchors &&
				(!anchor || !value || generateAnchor(clientId, editorValue) === anchor)
			) {
				nextAttributes.anchor = generateAnchor(clientId, value);
			}

			setAttributes(nextAttributes);
		},
		[anchor, canGenerateAnchors, clientId, editorValue, setAttributes]
	);

	const buildQueryString = useCallback(
		(next: Partial<MetaFieldAttributes> = {}) => {
			const resolvedMetaFieldType = (next.metaFieldType ?? metaFieldType) as NonNullMetaFieldType;
			const resolvedMetaKey = String(next.metaKey ?? metaKey ?? '');
			const resolvedFieldProvider = String(next.fieldProvider ?? fieldProvider ?? '');
			const resolvedPostType = String(next.postType ?? postType ?? '');
			const resolvedShowDataIndex = Boolean(next.showDataIndex ?? showDataIndex);
			const resolvedDataIndex = toNumber(next.dataIndex ?? dataIndex, 0);
			const resolvedReturnFormat = String(next.returnFormat ?? returnFormat ?? '');
			const resolvedOutputFormat = String(next.outputFormat ?? outputFormat ?? '');
			const resolvedTimeFormat = String(next.timeFormat ?? timeFormat ?? '');
			const resolvedDateFormat = String(next.dateFormat ?? dateFormat ?? '');

			if (!resolvedMetaKey) {
				return '';
			}

			const params = new URLSearchParams({
				metaFieldType: String(resolvedMetaFieldType),
				metaKey: resolvedMetaKey,
				postId: String(postId),
				fieldProvider: resolvedFieldProvider,
			});

			if (resolvedShowDataIndex) {
				params.set('dataIndex', String(resolvedDataIndex));
			}

			if (resolvedReturnFormat) {
				params.set('returnFormat', resolvedReturnFormat);
			}

			if (resolvedOutputFormat) {
				params.set('outputFormat', resolvedOutputFormat);
			}

			if (resolvedTimeFormat) {
				params.set('timeFormat', resolvedTimeFormat);
			}

			if (resolvedDateFormat) {
				params.set('dateFormat', resolvedDateFormat);
			}

			if (resolvedPostType) {
				params.set('postType', resolvedPostType);
			}

			return params.toString();
		},
		[
			metaFieldType,
			metaKey,
			fieldProvider,
			postType,
			showDataIndex,
			dataIndex,
			returnFormat,
			outputFormat,
			timeFormat,
			dateFormat,
			postId,
		]
	);

	const fetchAndStoreMetaValue = useCallback(
		async (next: Partial<MetaFieldAttributes> = {}) => {
			const resolvedMetaFieldType = (next.metaFieldType ?? metaFieldType) as NonNullMetaFieldType;
			const resolvedMetaKey = String(next.metaKey ?? metaKey ?? '');

			if (!resolvedMetaKey) {
				setAttributes({
					content: '',
					metaValue: '',
				});
				return;
			}

			try {
				const queryString = buildQueryString(next);

				const response = (await apiFetch({
					path: `${ZIORWPBlocks.restUrl}/${String(
						resolvedMetaFieldType
					)}/value/?${queryString}`,
					headers: {
						'X-WP-Nonce': wpApiSettings.nonce,
					},
				})) as { value?: unknown } | undefined;

				const value =
					typeof response?.value === 'string'
						? response.value
						: response?.value != null
							? String(response.value)
							: '';

				setAttributes({
					content: saveContent ? value : content,
					metaValue: value,
				});
			} catch {
				setAttributes({
					content: saveContent ? '' : content,
					metaValue: '',
				});
			}
		},
		[buildQueryString, content, metaFieldType, metaKey, saveContent, setAttributes]
	);

	const handleMetaKeyChange = useCallback(
		(nextMetaKey: string) => {
			setAttributes({
				metaKey: nextMetaKey,
			});

			void fetchAndStoreMetaValue({
				metaKey: nextMetaKey,
			});
		},
		[fetchAndStoreMetaValue, setAttributes]
	);

	const handleMetaFieldTypeChange = useCallback(
		(nextType: NonNullMetaFieldType) => {
			setAttributes({
				metaFieldType: nextType,
				metaKey: '',
				content: '',
				metaValue: '',
			});
		},
		[setAttributes]
	);

	const handleFieldProviderChange = useCallback(
		(nextFieldProvider: string) => {
			setAttributes({
				fieldProvider: nextFieldProvider,
			});

			if (metaKey) {
				void fetchAndStoreMetaValue({
					fieldProvider: nextFieldProvider,
				});
			}
		},
		[fetchAndStoreMetaValue, metaKey, setAttributes]
	);

	const handleSelectorAttributesChange = useCallback(
		(nextAttributes: Partial<MetaFieldAttributes>) => {
			setAttributes(nextAttributes);

			if (Object.prototype.hasOwnProperty.call(nextAttributes, 'fieldProvider')) {
				handleFieldProviderChange(String(nextAttributes.fieldProvider ?? ''));
			}
		},
		[handleFieldProviderChange, setAttributes]
	);

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
							onChange={handleMetaKeyChange}
							onTypeChange={handleMetaFieldTypeChange}
							attributes={
								attributes as unknown as MetaFieldSelectorProps['attributes']
							}
							setAttributes={
								handleSelectorAttributesChange as unknown as MetaFieldSelectorProps['setAttributes']
							}
						/>
					) : null}

					{showReturnFormat ? (
						<TextareaControl
							label={__('Template Tokens')}
							help={__('Define the output format using dynamic tokens.')}
							value={returnFormat}
							onChange={(value: string) => {
								setAttributes({ returnFormat: value });
								void fetchAndStoreMetaValue({ returnFormat: value });
							}}
							placeholder="{field_key}"
						/>
					) : null}

					{showDataIndex ? (
						<NumberControl
							label={__('Data Index')}
							help={__('Enter the index of the data for array-type meta fields')}
							value={dataIndex}
							onChange={(nextValue?: string) => {
								const nextIndex = toNumber(nextValue, 0);

								setAttributes({ dataIndex: nextIndex });
								void fetchAndStoreMetaValue({ dataIndex: nextIndex });
							}}
							placeholder="0"
						/>
					) : null}

					{showTimeControls ? (
						<TimeFormatControls
							timeFormat={timeFormat}
							outputFormat={outputFormat}
							showDateControls={showDateControls}
							dateFormat={dateFormat}
							onChange={(nextAttributes) => {
								setAttributes(nextAttributes as Partial<MetaFieldAttributes>);
								void fetchAndStoreMetaValue(
									nextAttributes as Partial<MetaFieldAttributes>
								);
							}}
						/>
					) : null}

					<SelectControl
						label={__('HTML tag')}
						value={tagName}
						options={tagOptions}
						onChange={(selected?: string) =>
							setAttributes({
								tagName: isTagName(selected) ? selected : 'h2',
							})
						}
					/>
				</PanelBody>
			</InspectorControls>

			<RichText
				identifier="content"
				tagName={tagName}
				value={editorValue}
				onChange={onContentChange}
				onMerge={mergeBlocks as never}
				onReplace={onReplace as never}
				onRemove={() => onReplace?.([])}
				placeholder={placeholder || __('Meta Field')}
				{...(!Platform.isWeb ? { deleteEnter: true } : undefined)}
				{...blockProps}
			/>
		</>
	);
}

export default MetaFieldEdit;