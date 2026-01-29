const { InnerBlocks } = wp.blockEditor;

export default function save() {
    return (
        <div className="ziorwebdev-add-to-cart">
            <InnerBlocks.Content />
        </div>
    );
}
