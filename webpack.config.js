import webpack from 'webpack';
import path from 'path';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';
import TerserPlugin from 'terser-webpack-plugin';

const isProduction = process.env.NODE_ENV === 'production';

export default {
  mode: isProduction ? 'production' : 'development',
  devtool: isProduction ? false : 'source-map',

  entry: {
    'blocks/editor': './resources/editor.js',
    'blocks/main': './resources/main.js',
  },

  externals: { jquery: 'jQuery' },

  output: {
    filename: `[name].min.js`,
    path: path.resolve('dist'),
    clean: true,
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: { presets: ['@babel/preset-env', '@babel/preset-react'] },
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
    usedExports: true,
    concatenateModules: true,
    minimizer: [
      new TerserPlugin({
        parallel: true,
        extractComments: false,
        terserOptions: {
          compress: {
            drop_console: isProduction,
            drop_debugger: isProduction,
            passes: 3,
            ecma: 2015,
          },
          format: { comments: false },
        },
      }),
      new CssMinimizerPlugin(),
    ],
    // No splitChunks → all code stays in entry files
    splitChunks: false,
  },

  performance: {
    hints: 'warning',
    maxEntrypointSize: 512000,
    maxAssetSize: 1024000,
  },

  plugins: [
    new webpack.ProvidePlugin({ $: 'jquery' }),
    new MiniCssExtractPlugin({ filename: `[name].min.css` }),
  ],
};
