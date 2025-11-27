/**
 * WordPress dependencies
 */
import { useRef } from '@wordpress/element';
import { ToolbarButton } from '@wordpress/block-editor';
import { Inserter } from '@wordpress/block-editor';
import { Icon, plus } from '@wordpress/icons';
import { __ } from '@wordpress/i18n';

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
    icon = plus,
    onSelectOrClose,
}) {
    const buttonRef = useRef();

    return (
        <Inserter
            rootClientId={rootClientId}
            position="bottom center"
            __experimentalIsQuick
            isAppender
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
        />
    );
}
