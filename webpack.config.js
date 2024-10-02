const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const spritePlugins = require('./scripts/generateSpritePlugins');

module.exports = {
  entry: './src/main.ts',
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    static: path.resolve(__dirname, 'dist'),
    hot: true,
    open: true,
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: [/\.vert$/, /\.frag$/],
        use: 'raw-loader',
      },
      // No need for file-loader or asset modules for images and audio
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  plugins: [
    // Add the CopyWebpackPlugin to copy assets to the dist folder
    new CopyWebpackPlugin({
      patterns: [
        { from: 'index.html', to: '' },
        { from: 'assets', to: 'assets', 
          // globOptions: {  //TODO ignore '**/art-*/**' ?
          //   ignore: [
          //     '**/_*/**',
          //   ],
          // },
        },
      ],
    }),
    ...spritePlugins
  ],
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/',
  },
};