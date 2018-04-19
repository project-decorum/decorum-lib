const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  mode: 'development',
  entry: __dirname + '/test/index.ts',
	output: {
    path: __dirname + '/dist/test',
		filename: 'bundle.js',
	},
  plugins: [
    new HtmlWebpackPlugin({
      template: __dirname +  '/test/index.html'
    })
  ],
  module: {
    exprContextCritical: false, // Mocha will complain otherwise
    rules: [
      { test: /\.ts$/, loader: 'awesome-typescript-loader' },
      { test: /\.css$/, use: [ 'style-loader', 'css-loader' ] },
    ]
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  node: {
    fs: 'empty', // Mocha will complain otherwise
  },
};
