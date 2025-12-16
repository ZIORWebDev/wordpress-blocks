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
const { PanelBody, SelectControl } = wp.components;
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
    link,
    metaKey,
    metaFieldType,
    fieldProvider,
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

  function extractLinkAttributes(html) {
    if (!html) return {};

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;

    const link = tempDiv.querySelector('a');
    if (!link) return { href: '', target: '', rel: '', class: '' };

    return {
      href: link.getAttribute('href') || '',
      target: link.getAttribute('target') || '',
      rel: link.getAttribute('rel') || '',
      class: link.getAttribute('class') || '',
    };
  }

  const fetchMetaValue = useCallback(
    async (metaKey, metaFieldType, fieldProvider) => {
      if (!metaKey) return;

      const currentPost = select('core/editor')?.getCurrentPost();
      const postId = currentPost?.id || 0;

      try {
        const response = await apiFetch({
          path: `/wordpress-blocks/v1/meta-value?type=${metaFieldType}&key=${metaKey}&post_id=${postId}&provider=${fieldProvider}`,
          headers: { 'X-WP-Nonce': wpApiSettings.nonce },
        });

        setAttributes({ content: response?.value ?? '' });
        console.log('Fetched meta value:', response?.value ?? '');
      } catch (error) {
        console.error('Meta fetch failed:', error);
        setAttributes({ content: '' });
      }
    },
    [setAttributes],
  );

  useEffect(() => {
    if (!metaKey) return;
    fetchMetaValue(metaKey, metaFieldType, fieldProvider || '');
  }, [metaKey, metaFieldType, fieldProvider, fetchMetaValue]);

  useEffect(() => {
    const linkAttrs = extractLinkAttributes(content);
    // Only update if different
    if (
      linkAttrs.href !== link.href ||
      linkAttrs.target !== link.target ||
      linkAttrs.rel !== link.rel ||
      linkAttrs.class !== link.class
    ) {
      setAttributes({ link: linkAttrs });
    }
  }, [content]);

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
          {attributes.showMetaSelector && (
            <MetaFieldSelector
              value={attributes.metaKey || ''}
              metaFieldType={attributes.metaFieldType || 'post_meta'}
              postType={attributes.postType || 'post'}
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
