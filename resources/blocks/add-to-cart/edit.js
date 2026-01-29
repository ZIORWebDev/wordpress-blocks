const { InnerBlocks } = wp.blockEditor;

export default function Edit() {
    return (
        <div className="zior-add-to-cart">
            <InnerBlocks
                allowedBlocks={['core/button']}
                template={[
                    ['core/button', { text: 'Get Product' }]
                ]}
            />
        </div>
    );
}
