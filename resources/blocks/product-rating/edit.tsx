/**
 * External dependencies
 */
import { clsx } from 'clsx';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { useEffect, useCallback, useRef, Platform } from '@wordpress/element';

import {
	AlignmentControl,
	BlockControls,
	RichText,
	useBlockProps,
	useBlockEditingMode,
	InspectorControls,
} from '@wordpress/block-editor';
import type { BlockEditProps } from '@wordpress/blocks';
import { PanelBody, __experimentalText as Text } from '@wordpress/components';

/**
 * Internal dependencies
 */
import { ProductSelector } from '@ziorweb-dev/product-selector';
import type { ProductAttributes, ProductValue } from './index';

type Props = BlockEditProps<ProductAttributes>;

const EMPTY_PRODUCT: ProductValue = { id: '', label: '' };

function Edit( { attributes, setAttributes, mergeBlocks, onReplace, style, context }: Props ) {
	const {
		textAlign,
		content = '',
		placeholder,
		helpText,
		product,
		showProductSelector
	} = attributes;
	const selectedProduct = context?.product?.id ? context.product : product;
	const blockProps = useBlockProps( {
		className: clsx( {
			[ `has-text-align-${ textAlign }` ]: !! textAlign,
		} ),
		style,
	} );

	const blockEditingMode = useBlockEditingMode();

	/**
	 * Bulletproof guards:
	 * - lastFetchedIdRef prevents re-fetch loops when `product` object identity changes.
	 * - reqSeqRef prevents stale responses from overwriting when user changes quickly.
	 */
	const lastFetchedIdRef = useRef<string>( '' );
	const reqSeqRef = useRef<number>( 0 );

	return (
		<>
			{ blockEditingMode === 'default' && (
				<BlockControls group="block">
					<AlignmentControl
						value={ textAlign }
						onChange={ ( nextAlign?: string ) =>
							setAttributes( { textAlign: nextAlign } )
						}
					/>
				</BlockControls>
			) }

			<InspectorControls>
				<PanelBody title={ __( 'Settings' ) } initialOpen={ true }>
					{ helpText && (
						<Text
							variant="small"
							style={ { marginBottom: '12px', display: 'block' } }
						>
							{ helpText }
						</Text>
					) }
					{ showProductSelector && (
					<ProductSelector
						value={ selectedProduct ?? EMPTY_PRODUCT }
						onChange={ ( nextProduct: ProductValue ) => {
							// Reset guards if product cleared
							const nextId = nextProduct?.id ? String( nextProduct.id ) : '';
							if ( ! nextId ) {
								lastFetchedIdRef.current = '';
								reqSeqRef.current++;
								setAttributes( { product: nextProduct, content: '' } );
								return;
							}

							setAttributes( { product: nextProduct } );
						}}
						onProductInformationChange={ ( productInfo ) => {
							setAttributes( {
								content: productInfo?.rating_html ?? '',
							} );
						} }
						/>
					) }
				</PanelBody>
			</InspectorControls>
			<div className="woocommerce">
				<RichText
					identifier="content"
					value={ content }
					onMerge={ mergeBlocks }
					onReplace={ onReplace }
					onRemove={ () => onReplace( [] ) }
					placeholder={ placeholder || __( 'Product Rating' ) }
					allowedFormats={ [] }
					textAlign={ textAlign }
					{ ...( Platform.isNative && { deleteEnter: true } ) }
					{ ...blockProps }
				/>
			</div>
		</>
	);
}

export default Edit;