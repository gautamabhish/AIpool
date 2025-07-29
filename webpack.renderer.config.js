const rules = require('./webpack.rules');
const path = require('path');

rules.push({
  test: /\.css$/i,
  use: ['style-loader', 'css-loader'],
});

module.exports = {
  mode: 'development',
  entry: './src/renderer/index.jsx',
  output: {
    filename: 'renderer.js',
    path: path.resolve(__dirname, 'dist'),
  },
  resolve: {
    extensions: ['.js', '.jsx'],
    fallback: {
      path: require.resolve('path-browserify'),
      os: require.resolve('os-browserify/browser'),
      crypto: require.resolve('crypto-browserify'),
      fs: false,
    },
  },
  module: {
    rules,
  },
};
