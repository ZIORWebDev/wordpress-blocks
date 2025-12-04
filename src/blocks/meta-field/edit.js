/**
 * External dependencies
 */
import clsx from 'clsx';

/**
 * WordPress dependencies (use global `wp` instead of module imports)
 */
const { __ } = wp.i18n;
const { useEffect, Platform } = wp.element;
const { useDispatch, useSelect } = wp.data;
const {
	AlignmentControl,
	BlockControls,
	RichText,
	useBlockProps,
	store: blockEditorStore,
	HeadingLevelDropdown,
	useBlockEditingMode,
} = wp.blockEditor;
const { InspectorControls } = wp.blockEditor;
const { PanelBody, SelectControl } = wp.components;

/**
 * Internal dependencies
 */
import { generateAnchor, setAnchor } from './autogenerate-anchors';

function MegaFieldEdit( {
	attributes,
	setAttributes,
	mergeBlocks,
	onReplace,
	style,
	clientId,
} ) {
	const { textAlign, content, level, levelOptions, placeholder, anchor, tagName } =
		attributes;
	const effectiveTag = tagName && tagName.length ? tagName : 'h' + level;
	const blockProps = useBlockProps( {
		className: clsx( {
			[ `has-text-align-${ textAlign }` ]: textAlign,
		} ),
		style,
	} );
	const blockEditingMode = useBlockEditingMode();

	const { canGenerateAnchors } = useSelect( ( select ) => {
		const { getGlobalBlockCount, getSettings } = select( blockEditorStore );
		const settings = getSettings();

		return {
			canGenerateAnchors:
				!! settings.generateAnchors ||
				getGlobalBlockCount( 'core/table-of-contents' ) > 0,
		};
	}, [] );

	const { __unstableMarkNextChangeAsNotPersistent } =
		useDispatch( blockEditorStore );

	// Initially set anchor for headings that have content but no anchor set.
	// This is used when transforming a block to heading, or for legacy anchors.
	useEffect( () => {
		if ( ! canGenerateAnchors ) {
			return;
		}

		if ( ! anchor && content ) {
			// This side-effect should not create an undo level.
			__unstableMarkNextChangeAsNotPersistent();
			setAttributes( {
				anchor: generateAnchor( clientId, content ),
			} );
		}
		setAnchor( clientId, anchor );

		// Remove anchor map when block unmounts.
		return () => setAnchor( clientId, null );
	}, [ anchor, content, clientId, canGenerateAnchors ] );

	const onContentChange = ( value ) => {
		const newAttrs = { content: value };
		if (
			canGenerateAnchors &&
			( ! anchor ||
				! value ||
				generateAnchor( clientId, content ) === anchor )
		) {
			newAttrs.anchor = generateAnchor( clientId, value );
		}
		setAttributes( newAttrs );
	};

	return (
		<>
			{ blockEditingMode === 'default' && (
				<BlockControls group="block">
					<HeadingLevelDropdown
						value={ level }
						options={ levelOptions }
						onChange={ ( newLevel ) =>
							setAttributes( { level: newLevel, tagName: '' } )
						}
					/>
					<AlignmentControl
						value={ textAlign }
						onChange={ ( nextAlign ) => {
							setAttributes( { textAlign: nextAlign } );
						} }
					/>
				</BlockControls>
			) }
			<InspectorControls>
				<PanelBody title={ __( 'Meta Field Settings' ) } initialOpen={ true }>
					<SelectControl
						label={ __( 'Meta Field Type' ) }
						value={ '' }
						options={[
							{ label: '', value: '-' },
							{ label: 'Options', value: 'options' },
							{ label: 'Post Meta', value: 'post_meta' }
						] }
						onChange={ ( next ) => {
							// If user picked an hN, sync level and clear tagName so headings use `level`.
							// if ( next && next.startsWith && next.startsWith( 'h' ) ) {
							// 	const parsed = parseInt( next.substr( 1 ), 10 );
							// 	setAttributes( { level: isNaN( parsed ) ? level : parsed, tagName: '' } );
							// } else {
							// 	setAttributes( { tagName: next } );
							// }
						} }
					/>
					<SelectControl
						label={ __( 'Field Provider' ) }
						value={ '' }
						options={[
							{ label: '', value: '-' },
							{ label: 'ACF', value: 'acf' },
							{ label: 'Default', value: 'default' },
							{ label: 'Meta Box', value: 'metabox' },
							{ label: 'Pods', value: 'pods' },
							{ label: 'Carbon Field', value: 'carbon_field' }
						] }
						onChange={ ( next ) => {
							// If user picked an hN, sync level and clear tagName so headings use `level`.
							// if ( next && next.startsWith && next.startsWith( 'h' ) ) {
							// 	const parsed = parseInt( next.substr( 1 ), 10 );
							// 	setAttributes( { level: isNaN( parsed ) ? level : parsed, tagName: '' } );
							// } else {
							// 	setAttributes( { tagName: next } );
							// }
						} }
					/>
					<SelectControl
						label={ __( 'HTML tag' ) }
						value={ effectiveTag }
						options={ [
							{ label: 'H1', value: 'h1' },
							{ label: 'H2', value: 'h2' },
							{ label: 'H3', value: 'h3' },
							{ label: 'H4', value: 'h4' },
							{ label: 'H5', value: 'h5' },
							{ label: 'H6', value: 'h6' },
							{ label: 'Paragraph', value: 'p' },
							{ label: 'Div', value: 'div' },
							{ label: 'Span', value: 'span' },
						] }
						onChange={ ( next ) => {
							// If user picked an hN, sync level and clear tagName so headings use `level`.
							if ( next && next.startsWith && next.startsWith( 'h' ) ) {
								const parsed = parseInt( next.substr( 1 ), 10 );
								setAttributes( { level: isNaN( parsed ) ? level : parsed, tagName: '' } );
							} else {
								setAttributes( { tagName: next } );
							}
						} }
					/>
				</PanelBody>
			</InspectorControls>
			<RichText
				identifier="content"
				tagName={ effectiveTag }
				value={ content }
				onChange={ onContentChange }
				onMerge={ mergeBlocks }
				onReplace={ onReplace }
				onRemove={ () => onReplace( [] ) }
				placeholder={ placeholder || __( 'Meta Field' ) }
				textAlign={ textAlign }
				{ ...( Platform.isNative && { deleteEnter: true } ) } // setup RichText on native mobile to delete the "Enter" key as it's handled by the JS/RN side
				{ ...blockProps }
			/>
		</>
	);
}

export default MegaFieldEdit;
