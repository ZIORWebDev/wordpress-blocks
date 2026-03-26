/**
 * External dependencies
 */
import { clsx } from 'clsx';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { useMemo, useCallback, Platform } from '@wordpress/element';
import {
	AlignmentControl,
	BlockControls,
	RichText,
	useBlockProps,
	useBlockEditingMode,
	InspectorControls,
} from '@wordpress/block-editor';
import type { BlockEditProps } from '@wordpress/blocks';
import {
	PanelBody,
	SelectControl,
	__experimentalText as Text,
} from '@wordpress/components';

/**
 * Internal dependencies
 */
import metadata from '../../../src/Blocks/ProductPrice/block.json';
import { ProductSelector } from '@ziorweb-dev/product-selector';
import type { ProductAttributes, ProductValue } from './index';

type Props = BlockEditProps<ProductAttributes>;

const EMPTY_PRODUCT: ProductValue = {
	id: '',
	label: '',
	price: '',
};

function Edit( {
	attributes,
	setAttributes,
	mergeBlocks,
	onReplace,
	style,
	context,
}: Props ) {
	const {
		textAlign,
		placeholder,
		tagName,
		helpText,
		product,
		showProductSelector,
	} = attributes;

	const selectedProduct =
		context?.product?.id
			? {
					...( product ?? EMPTY_PRODUCT ),
					...context.product,
			  }
			: ( product ?? EMPTY_PRODUCT );

	const currentPrice = selectedProduct?.price ?? '';

	const tagOptions = useMemo( () => {
		const tagNameEnum = metadata.attributes.tagName.enum as string[];

		return tagNameEnum.map( ( value ) => ( {
			label: value.toUpperCase(),
			value,
		} ) );
	}, [] );

	const blockProps = useBlockProps( {
		className: clsx( {
			[ `has-text-align-${ textAlign }` ]: !! textAlign,
		} ),
		style,
	} );

	const blockEditingMode = useBlockEditingMode();

	const handleProductChange = useCallback(
		( nextProduct: ProductValue ) => {
			const nextId = nextProduct?.id ? String( nextProduct.id ) : '';
			const nextLabel = nextProduct?.label ?? '';

			if ( ! nextId ) {
				const isAlreadyEmpty =
					! String( product?.id ?? '' ) &&
					! String( product?.label ?? '' ) &&
					! String( product?.price ?? '' );

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
				price: nextProduct?.price ?? '',
			};

			const hasChanged =
				String( product?.id ?? '' ) !== String( nextValue.id ?? '' ) ||
				String( product?.label ?? '' ) !== String( nextValue.label ?? '' ) ||
				String( product?.price ?? '' ) !== String( nextValue.price ?? '' );

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
		( productInfo?: { price_html?: string } | null ) => {
			const nextPrice = productInfo?.price_html ?? '';
			const currentStoredPrice = String( product?.price ?? '' );
			const currentStoredId = String( product?.id ?? '' );
			const selectedId = String( selectedProduct?.id ?? '' );
			const selectedLabel = String( selectedProduct?.label ?? '' );

			if ( currentStoredPrice === nextPrice && currentStoredId === selectedId ) {
				return;
			}

			setAttributes( {
				product: {
					...EMPTY_PRODUCT,
					...selectedProduct,
					id: selectedId,
					label: selectedLabel,
					price: nextPrice,
				},
			} );
		},
		[ product?.price, product?.id, selectedProduct, setAttributes ]
	);

	const handleProductInformationError = useCallback( () => {
		// optional: handle/log error here
	}, [] );

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
							value={ selectedProduct }
							onChange={ handleProductChange }
							onProductInformationChange={ handleProductInformationChange }
							onProductInformationError={ handleProductInformationError }
						/>
					) }

					<SelectControl
						label={ __( 'HTML tag' ) }
						value={ tagName }
						options={ tagOptions }
						onChange={ ( selected?: string ) =>
							setAttributes( { tagName: selected } )
						}
					/>
				</PanelBody>
			</InspectorControls>

			<RichText
				identifier="price"
				tagName={ tagName }
				value={ currentPrice }
				onMerge={ mergeBlocks }
				onReplace={ onReplace }
				onRemove={ () => onReplace( [] ) }
				placeholder={ placeholder || __( 'Product Price' ) }
				allowedFormats={ [] }
				textAlign={ textAlign }
				{ ...( Platform.isNative ? { deleteEnter: true } : {} ) }
				{ ...blockProps }
			/>
		</>
	);
}

export default Edit;