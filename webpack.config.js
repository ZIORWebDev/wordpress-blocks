import path from 'path';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';
import TerserPlugin from 'terser-webpack-plugin';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';

const isProduction = process.env.NODE_ENV === 'production';

/** @type {import('webpack').Configuration} */
export default {
	mode: isProduction ? 'production' : 'development',
	devtool: isProduction ? false : 'eval-cheap-module-source-map',

	entry: {
		'blocks/editor': './resources/editor.ts',
		'blocks/view': './resources/view.ts',
	},

	output: {
		filename: '[name].min.js',
		path: path.resolve(process.cwd(), 'dist'),
		clean: true,
	},

	cache: { type: 'filesystem' },

	// WP best practice: do not bundle these; WP provides them.
	externals: {
		// React (provided by WordPress)
		react: 'React',
		'react-dom': 'ReactDOM',

		// WordPress packages
		'@wordpress/blocks': ['wp', 'blocks'],
		'@wordpress/i18n': ['wp', 'i18n'],
		'@wordpress/element': ['wp', 'element'],
		'@wordpress/components': ['wp', 'components'],
		'@wordpress/block-editor': ['wp', 'blockEditor'],
		'@wordpress/data': ['wp', 'data'],
		'@wordpress/core-data': ['wp', 'coreData'],
		'@wordpress/hooks': ['wp', 'hooks'],
		'@wordpress/api-fetch': ['wp', 'apiFetch'],
		'@wordpress/compose': ['wp', 'compose'],
		'@wordpress/blob': ['wp', 'blob'],
	},

	resolve: {
		extensions: ['.ts', '.tsx', '.js', '.jsx', '.mjs'],
	},

	module: {
		rules: [
			// Fix Webpack 5 strict ESM "fully specified" resolution inside some deps
			{
				test: /\.m?js$/,
				include: /node_modules[\\/](?:@wordpress|diff)[\\/]/,
				resolve: { fullySpecified: false },
			},

			// Supports TS/TSX + JS/JSX during migration
			{
				test: /\.[jt]sx?$/,
				exclude: /node_modules/,
				use: {
					loader: 'babel-loader',
					options: {
						cacheDirectory: true,
						presets: [
							['@babel/preset-env', { targets: 'defaults' }],
							// Classic runtime avoids importing react/jsx-runtime (better for WP externals)
							['@babel/preset-react', { runtime: 'classic' }],
							['@babel/preset-typescript', { allExtensions: true, isTSX: true }],
						],
					},
				},
			},

			{
				test: /\.(sc|sa|c)ss$/,
				use: [
					MiniCssExtractPlugin.loader,
					{ loader: 'css-loader', options: { sourceMap: !isProduction } },
					{ loader: 'sass-loader', options: { sourceMap: !isProduction } },
				],
			},
		],
	},

	optimization: {
		minimizer: [
			new TerserPlugin({
				parallel: true,
				extractComments: false,
				terserOptions: {
					compress: {
						drop_console: isProduction,
						drop_debugger: isProduction,
					},
					format: { comments: false },
				},
			}),
			new CssMinimizerPlugin(),
		],
		splitChunks: false,
	},

	performance: {
		hints: 'warning',
		maxEntrypointSize: 512000,
		maxAssetSize: 1024000,
	},

	plugins: [
		new MiniCssExtractPlugin({ filename: '[name].min.css' }),

		// Type-check in a separate process (keeps builds fast)
		new ForkTsCheckerWebpackPlugin({
			typescript: {
				configFile: path.resolve(process.cwd(), 'tsconfig.json'),
			},
		}),
	],
};
