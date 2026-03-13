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

type ProductValue = {
	id: string;
	label: string;
};

interface Attributes {
	textAlign?: string;
	content?: string;
	placeholder?: string;
	anchor?: string;
	helpText?: string;
	product?: ProductValue;
}

type Props = BlockEditProps<Attributes>;

const EMPTY_PRODUCT: ProductValue = { id: '', label: '' };

function Edit( { attributes, setAttributes, mergeBlocks, onReplace, style }: Props ) {
	const {
		textAlign,
		content = '',
		placeholder,
		helpText,
		product,
	} = attributes;

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

	const fetchAndSetContent = useCallback(
		async ( productId: string ) => {
			if ( ! productId ) return;

			const seq = ++reqSeqRef.current;

			try {
				const info = await fetchProductInformation( productId );
				// Ignore stale responses
				if ( seq !== reqSeqRef.current ) return;

				setAttributes( { content: info?.rating_html ?? '' } );
			} catch {
				if ( seq !== reqSeqRef.current ) return;
				setAttributes( { content: '' } );
			}
		},
		[ setAttributes ]
	);

	useEffect( () => {
	const pid = product?.id ? String(product.id) : '';
		if ( ! pid ) return;

		// Only fetch when productId actually changes
		if ( lastFetchedIdRef.current === pid ) return;
		lastFetchedIdRef.current = pid;

		void fetchAndSetContent( pid );
	}, [ product?.id, fetchAndSetContent ] );

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
					{ attributes.showProductSelector && (
					<ProductSelector
						value={ product ?? EMPTY_PRODUCT }
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