const { InnerBlocks } = wp.blockEditor;

export default function save() {
    return (
        <div className="zior-add-to-cart">
            <InnerBlocks.Content />
        </div>
    );
}
