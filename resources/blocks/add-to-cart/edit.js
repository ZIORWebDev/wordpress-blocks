const { InnerBlocks, InspectorControls, useBlockProps } = wp.blockEditor;
const { PanelBody } = wp.components;

import ProductSelector from '../../components/product-selector';

export default function Edit({ attributes, setAttributes, clientId }) {
  const { productId } = attributes;
  const blockProps = useBlockProps({
    className: 'zior-add-to-cart',
  });

  return (
    <>
      <InspectorControls>
        <PanelBody title="Product" initialOpen={true}>
          <ProductSelector
            value={productId}
            onChange={(productId) => setAttributes({ productId })}
            clientId={clientId}
          />
        </PanelBody>
      </InspectorControls>

      <div {...blockProps}>
        <InnerBlocks
          allowedBlocks={['core/button']}
          template={[['core/button', { text: 'Get Product' }]]}
        />
      </div>
    </>
  );
}
