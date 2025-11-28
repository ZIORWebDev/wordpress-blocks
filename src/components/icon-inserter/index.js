/**
 * WordPress dependencies
 */
// wp.element
const { useRef } = wp.element;

// wp.components
const { ToolbarButton, Icon } = wp.components;

// wp.blockEditor
const { Inserter } = wp.blockEditor;

// wp.icons
import { brush } from '@wordpress/icons';

// wp.i18n
const { __ } = wp.i18n;

/**
 * ToolbarBlockInserter
 *
 * @param {Object} props
 * @param {string} props.rootClientId The parent block's clientId
 * @param {string} [props.label] Label for the toolbar button
 * @param {Object} [props.icon] Icon for the toolbar button (defaults to `plus`)
 * @param {Function} [props.onSelectOrClose] Callback when block is inserted or inserter is closed
 */
export default function ToolbarBlockInserter({
    rootClientId,
    label = __('Add block'),
    icon = brush,
    onSelectOrClose,
}) {
    const buttonRef = useRef();

    return (
        <Inserter
            rootClientId={rootClientId}
            position="bottom center"
            __experimentalIsQuick={true}
            isAppender={ true }
            anchorRef={buttonRef}
            onSelectOrClose={onSelectOrClose}
            renderToggle={({ onToggle, isOpen, disabled }) => (
                <ToolbarButton
                    icon={icon}
                    label={label}
                    onClick={onToggle} // toggle the inserter popover
                    aria-expanded={isOpen}
                    disabled={disabled}
                    ref={buttonRef}
                />
            )}
            onSelect={( block ) => {
                // Remove existing icon blocks
                const innerBlocks = wp.data.select('core/block-editor').getBlocks(rootClientId);
                innerBlocks.forEach((b) => {
                    if (b.name === 'ziorwebdev/icon') {
                        wp.data.dispatch('core/block-editor').removeBlock(b.clientId);
                    }
                });

                // Insert the new block
                wp.data.dispatch('core/block-editor').insertBlock(block, undefined, rootClientId);
            }}
        />
    );
}
