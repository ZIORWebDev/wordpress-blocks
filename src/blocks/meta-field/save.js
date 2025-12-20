/**
 * External dependencies
 */
import clsx from 'clsx';

/**
 * WordPress dependencies
 */
/* WordPress dependencies (use global `wp` instead of module imports) */
const { RichText, useBlockProps } = wp.blockEditor;

export default function save({ attributes }) {
  const { textAlign, content, level, tagName } = attributes;
  const HtmlTag = tagName && tagName.length ? tagName : 'h' + level;

  if (!attributes.saveContent) {
    return <HtmlTag {...useBlockProps.save()}></HtmlTag>;
  }

  const className = clsx({
    [`has-text-align-${textAlign}`]: textAlign,
  });

  // Persist the link URL (if present) as a data attribute so it is available
  // to the server render callback via block attributes.
  const dataAttrs = {
    className: className,
    'data-link-url':
      (attributes?.link && attributes.link.url) || attributes?.url || '',
  };

  return (
    <HtmlTag {...useBlockProps.save(dataAttrs)}>
      <RichText.Content value={content} />
    </HtmlTag>
  );
}
