const { InnerBlocks, InspectorControls } = wp.blockEditor;
const { PanelBody } = wp.components;
const { useEffect } = wp.element;
const { useSelect, useDispatch } = wp.data;
const { createBlock } = wp.blocks;

import ProductSelector from '../../components/product-selector';

export default function Edit({ clientId }) {
    const innerBlocks = useSelect((select) => {
        return select('core/block-editor').getBlocks(clientId) || [];
    }, [clientId]);

    const { updateBlockAttributes, insertBlocks } = useDispatch('core/block-editor');

    const findFirstButtonBlock = (blocks) => {
        for (const block of blocks) {
            if (block.name === 'core/button') return block;
            if (block.innerBlocks && block.innerBlocks.length) {
                const match = findFirstButtonBlock(block.innerBlocks);
                if (match) return match;
            }
        }
        return null;
    };

    const currentButton = findFirstButtonBlock(innerBlocks);

    // Determine current product id from first inner button URL
    const currentUrl = currentButton && currentButton.attributes ? currentButton.attributes.url || '' : '';
    let initialProduct = '';
    if (currentUrl) {
        const match = currentUrl.match(/[?&]add-to-cart=(\d+)/);
        if (match) initialProduct = match[1];
    }

    useEffect(() => {
        if (innerBlocks.length > 0) return;
        insertBlocks(
            createBlock('core/buttons', {}, [
                createBlock('core/button', { text: 'Get Product' }),
            ]),
            0,
            clientId
        );
    }, [clientId, createBlock, innerBlocks.length, insertBlocks]);

    const onProductChange = (productId) => {
        const buttonBlock = findFirstButtonBlock(innerBlocks);
        if (!buttonBlock) return;
        const url = productId ? `?add-to-cart=${productId}` : '';
        updateBlockAttributes(buttonBlock.clientId, { url });
    };

    return (
        <>
            <InspectorControls>
                <PanelBody title="Product" initialOpen={true}>
                    <ProductSelector value={initialProduct} onChange={onProductChange} />
                </PanelBody>
            </InspectorControls>
            <div className="zior-add-to-cart">
                <InnerBlocks
                    allowedBlocks={['core/buttons']}
                    template={[
                        ['core/buttons', {}, [
                            ['core/button', { text: 'Get Product' }],
                        ]],
                    ]}
                />
            </div>
        </>
    );
}
