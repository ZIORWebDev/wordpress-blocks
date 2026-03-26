/**
 * External dependencies
 */
import { clsx } from 'clsx';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { useCallback, Platform } from '@wordpress/element';
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

type ProductContextValue = Partial<ProductValue> & {
	id?: string | number;
	label?: string;
	rating?: string;
};

type ProductInfo = {
	rating_html?: string;
};

const EMPTY_PRODUCT: ProductValue = {
	id: '',
	label: '',
	rating: '',
};

function Edit( {
	attributes,
	setAttributes,
	mergeBlocks,
	onReplace,
	style,
	context,
}: Props ) {
	const { textAlign, placeholder, helpText, product, showProductSelector } =
		attributes;

	const contextProduct = ( context?.product ?? null ) as ProductContextValue | null;

	const selectedProduct: ProductValue =
		contextProduct?.id
			? {
					...EMPTY_PRODUCT,
					...( product ?? EMPTY_PRODUCT ),
					id: String( contextProduct.id ?? '' ),
					label: contextProduct.label ?? product?.label ?? '',
					rating: contextProduct.rating ?? product?.rating ?? '',
			  }
			: {
					...EMPTY_PRODUCT,
					...( product ?? EMPTY_PRODUCT ),
			  };

	const currentRating = selectedProduct.rating ?? '';

	const blockProps = useBlockProps( {
		className: clsx( {
			[ `has-text-align-${ textAlign }` ]: !! textAlign,
		} ),
		style,
	} );

	const blockEditingMode = useBlockEditingMode();

	const handleProductChange = useCallback(
		( nextProduct: ProductValue | null | undefined ) => {
			const nextId = nextProduct?.id ? String( nextProduct.id ) : '';
			const nextLabel = nextProduct?.label ?? '';

			if ( ! nextId ) {
				const isAlreadyEmpty =
					! String( product?.id ?? '' ) &&
					! String( product?.label ?? '' ) &&
					! String( product?.rating ?? '' );

				if ( isAlreadyEmpty ) {
					return;
				}

				setAttributes( {
					product: EMPTY_PRODUCT,
				} );
				return;
			}

			const nextValue: ProductValue = {
				...EMPTY_PRODUCT,
				...nextProduct,
				id: nextId,
				label: nextLabel,
				rating: nextProduct?.rating ?? '',
			};

			const hasChanged =
				String( product?.id ?? '' ) !== String( nextValue.id ?? '' ) ||
				String( product?.label ?? '' ) !== String( nextValue.label ?? '' ) ||
				String( product?.rating ?? '' ) !== String( nextValue.rating ?? '' );

			if ( ! hasChanged ) {
				return;
			}

			setAttributes( {
				product: nextValue,
			} );
		},
		[ product, setAttributes ]
	);

	const handleProductInformationChange = useCallback(
		( productInfo?: ProductInfo | null ) => {
			const nextRating = productInfo?.rating_html ?? '';
			const selectedId = String( selectedProduct?.id ?? '' );
			const selectedLabel = selectedProduct?.label ?? '';
			const currentStoredId = String( product?.id ?? '' );
			const currentStoredRating = String( product?.rating ?? '' );
			const currentStoredLabel = String( product?.label ?? '' );

			if (
				currentStoredId === selectedId &&
				currentStoredLabel === selectedLabel &&
				currentStoredRating === nextRating
			) {
				return;
			}

			setAttributes( {
				product: {
					...EMPTY_PRODUCT,
					...selectedProduct,
					id: selectedId,
					label: selectedLabel,
					rating: nextRating,
				},
			} );
		},
		[ product?.id, product?.label, product?.rating, selectedProduct, setAttributes ]
	);

	const handleProductInformationError = useCallback( () => {
		// Optional: add notice/logging here.
	}, [] );

	return (
		<>
			{ blockEditingMode === 'default' && (
				<BlockControls group="block">
					<AlignmentControl
						value={ textAlign }
						onChange={ ( nextAlign?: string ) => {
							setAttributes( {
								textAlign: nextAlign,
							} );
						} }
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
							value={ selectedProduct }
							onChange={ handleProductChange }
							onProductInformationChange={ handleProductInformationChange }
							onProductInformationError={ handleProductInformationError }
						/>
					) }
				</PanelBody>
			</InspectorControls>

			<div className="woocommerce">
				<RichText
					identifier="content"
					value={ currentRating }
					onMerge={ mergeBlocks }
					onReplace={ onReplace }
					onRemove={ () => onReplace( [] ) }
					placeholder={ placeholder || __( 'Product Rating' ) }
					allowedFormats={ [] }
					tagName="div"
					textAlign={ textAlign }
					{ ...( Platform.isNative ? { deleteEnter: true } : {} ) }
					{ ...blockProps }
				/>
			</div>
		</>
	);
}

export default Edit;