/**
 * External dependencies
 */
import clsx from 'clsx';

/**
 * WordPress dependencies (use global `wp` instead of module imports)
 */
const { __ } = wp.i18n;
const { useEffect, Platform, useCallback } = wp.element;
const { useDispatch, useSelect, select } = wp.data;
const {
  AlignmentControl,
  BlockControls,
  RichText,
  useBlockProps,
  store: blockEditorStore,
  useBlockEditingMode,
} = wp.blockEditor;
const { InspectorControls } = wp.blockEditor;
const {
  PanelBody,
  SelectControl,
  TextControl,
  __experimentalNumberControl: NumberControl,
} = wp.components;
const apiFetch = wp.apiFetch;
/**
 * Internal dependencies
 */
import { generateAnchor, setAnchor } from './autogenerate-anchors';
import MetaFieldSelector from '../../components/meta-field-selector';

function MegaFieldEdit({
  attributes,
  setAttributes,
  mergeBlocks,
  onReplace,
  style,
  clientId,
}) {
  const {
    textAlign,
    content,
    level,
    placeholder,
    anchor,
    tagName,
    metaKey,
    metaFieldType,
    fieldProvider,
    showMetaSelector,
    postType,
    returnFormat,
    showReturnFormat,
    dataIndex,
    showDataIndex,
  } = attributes;
  const effectiveTag = tagName && tagName.length ? tagName : 'h' + level;
  const blockProps = useBlockProps({
    className: clsx({
      [`has-text-align-${textAlign}`]: textAlign,
    }),
    style,
  });
  const blockEditingMode = useBlockEditingMode();
  const { canGenerateAnchors } = useSelect((select) => {
    const { getGlobalBlockCount, getSettings } = select(blockEditorStore);
    const settings = getSettings();

    return {
      canGenerateAnchors:
        !!settings.generateAnchors ||
        getGlobalBlockCount('core/table-of-contents') > 0,
    };
  }, []);

  const { __unstableMarkNextChangeAsNotPersistent } =
    useDispatch(blockEditorStore);

  // Initially set anchor for headings that have content but no anchor set.
  // This is used when transforming a block to heading, or for legacy anchors.
  useEffect(() => {
    if (!canGenerateAnchors) {
      return;
    }

    if (!anchor && content) {
      // This side-effect should not create an undo level.
      __unstableMarkNextChangeAsNotPersistent();
      setAttributes({
        anchor: generateAnchor(clientId, content),
      });
    }
    setAnchor(clientId, anchor);

    // Remove anchor map when block unmounts.
    return () => setAnchor(clientId, null);
  }, [anchor, content, clientId, canGenerateAnchors]);

  const onContentChange = (value) => {
    const newAttrs = { content: value };
    if (
      canGenerateAnchors &&
      (!anchor || !value || generateAnchor(clientId, content) === anchor)
    ) {
      newAttrs.anchor = generateAnchor(clientId, value);
    }
    setAttributes(newAttrs);
  };

  const fetchMetaValue = useCallback(
    async (metaKey, metaFieldType, fieldProvider, returnFormat, dataIndex) => {
      if (!metaKey) return;

      const currentPost = select('core/editor')?.getCurrentPost();
      const postId = currentPost?.id || 0;

      try {
        const response = await apiFetch({
          path: `/wordpress-blocks/v1/meta-value?type=${metaFieldType}&key=${metaKey}&index${dataIndex}&post_id=${postId}&provider=${fieldProvider}&return_format=${encodeURIComponent(
            returnFormat || '',
          )}`,
          headers: { 'X-WP-Nonce': wpApiSettings.nonce },
        });

        setAttributes({ content: response?.value ?? '' });
      } catch (error) {
        setAttributes({ content: '' });
      }
    },
    [setAttributes],
  );

  useEffect(() => {
    if (!metaKey) return;
    fetchMetaValue(
      metaKey,
      metaFieldType,
      fieldProvider,
      returnFormat,
      dataIndex,
    );
  }, [
    metaKey,
    metaFieldType,
    fieldProvider,
    // fetchMetaValue,
    returnFormat,
    dataIndex,
  ]);

  return (
    <>
      {blockEditingMode === 'default' && (
        <BlockControls group="block">
          <AlignmentControl
            value={textAlign}
            onChange={(nextAlign) => {
              setAttributes({ textAlign: nextAlign });
            }}
          />
        </BlockControls>
      )}

      <InspectorControls>
        <PanelBody title={__('Meta Field Settings')} initialOpen={true}>
          {showMetaSelector && (
            <MetaFieldSelector
              value={metaKey || ''}
              metaFieldType={metaFieldType || 'post_meta'}
              postType={postType || 'post'}
              onChange={(next) => setAttributes({ metaKey: next })}
              onTypeChange={(nextType) =>
                setAttributes({ metaFieldType: nextType })
              }
              onPostTypeChange={(nextPostType) =>
                setAttributes({ postType: nextPostType })
              }
              attributes={attributes}
              setAttributes={setAttributes}
            />
          )}
          {showReturnFormat && (
            <TextControl
              label={__('Template Tokens')}
              help={__(
                'Define the output format using dynamic tokens such as {street_address}.',
              )}
              value={returnFormat || ''}
              onChange={(value) => setAttributes({ returnFormat: value })}
              placeholder="{field_key}"
            />
          )}
          {showDataIndex && (
            <NumberControl
              label={__('Data Index')}
              help={__(
                'Enter the index of the data for array-type meta fields',
              )}
              value={dataIndex ?? 0}
              onChange={(value) => setAttributes({ dataIndex: value })}
              placeholder="0"
            />
          )}
          <SelectControl
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
            onChange={(selected) => {
              // If user picked an hN, sync level and clear tagName so headings use `level`.
              if (selected && selected.startsWith && selected.startsWith('h')) {
                const parsed = parseInt(selected.substr(1), 10);
                const currentLevel = isNaN(parsed) ? level : parsed;
                setAttributes({
                  level: currentLevel,
                  tagName: 'h' + currentLevel,
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
        onMerge={mergeBlocks}
        onReplace={onReplace}
        onRemove={() => onReplace([])}
        placeholder={placeholder || __('Meta Field')}
        textAlign={textAlign}
        {...(Platform.isNative && { deleteEnter: true })} // setup RichText on native mobile to delete the "Enter" key as it's handled by the JS/RN side
        {...blockProps}
      />
    </>
  );
}

export default MegaFieldEdit;
