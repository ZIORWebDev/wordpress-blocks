import path from 'path';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';
import TerserPlugin from 'terser-webpack-plugin';

const isProduction = process.env.NODE_ENV === 'production';

export default {
  mode: isProduction ? 'production' : 'development',
  devtool: isProduction ? false : 'eval-cheap-module-source-map',

  entry: {
    'blocks/editor': './resources/editor.ts',
    'blocks/view': './resources/view.ts',
  },

  output: {
    filename: `[name].min.js`,
    path: path.resolve('dist'),
    clean: true,
  },

  cache: { type: 'filesystem' },

  // WP best practice: do not bundle these; WP provides them.
  externals: {
    react: 'React',
    'react-dom': 'ReactDOM',
    '@wordpress/blocks': ['wp', 'blocks'],
    '@wordpress/i18n': ['wp', 'i18n'],
    '@wordpress/element': ['wp', 'element'],
    '@wordpress/components': ['wp', 'components'],
    '@wordpress/block-editor': ['wp', 'blockEditor'],
    '@wordpress/data': ['wp', 'data'],
    '@wordpress/hooks': ['wp', 'hooks'],
    '@wordpress/api-fetch': ['wp', 'apiFetch'],
  },

  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.mjs'],
  },

  module: {
    rules: [
      // Fix Webpack 5 strict ESM "fully specified" resolution inside @wordpress deps
      {
        test: /\.m?js$/,
        include: /node_modules[\\/](?:@wordpress|diff)[\\/]/,
        resolve: { fullySpecified: false },
      },

      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'ts-loader',
            options: { transpileOnly: true },
          },
        ],
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

  plugins: [new MiniCssExtractPlugin({ filename: `[name].min.css` })],
};
