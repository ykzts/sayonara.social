const CopyPlugin = require('copy-webpack-plugin');
const HtmlPlugin = require('html-webpack-plugin');
const path = require('path');
const { EnvironmentPlugin } = require('webpack');
const { name } = require('./package.json');

module.exports = (env = process.env.NODE_ENV || 'development') => ({
  devServer: {
    historyApiFallback: true,
  },
  devtool: 'source-map',
  entry: {
    main: path.resolve(__dirname, 'src', 'main.js'),
  },
  mode: env === 'production' ? 'production' : 'development',
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          {
            loader: 'style-loader',
          },
          {
            loader: 'css-loader',
          },
        ],
      },
      {
        exclude: /\/node_modules\//,
        test: /\.js$/,
        use: {
          loader: 'babel-loader',
        },
      },
    ],
  },
  output: {
    path: path.resolve(__dirname, 'build', 'public'),
    publicPath: '/',
    filename: env === 'production' ? '[name].[chunkhash].js' : '[name].js?[chunkhash]',
  },
  plugins: [
    new EnvironmentPlugin({
      NODE_ENV: env,
    }),
    new HtmlPlugin({
      minify: env === 'production' ? {
        collapseBooleanAttributes: true,
        collapseInlineTagWhitespace: true,
        collapseWhitespace: true,
        includeAutoGeneratedTags: false,
        removeAttributeQuotes: true,
        removeComments: true,
        removeOptionalTags: true,
        removeScriptTypeAttributes: true,
        removeStyleLinkTypeAttributes: true,
        sortAttributes: true,
        sortClassName: true,
      } : false,
      template: path.resolve(__dirname, 'src', 'templates', 'index.html.ejs'),
      title: name,
    }),
    ...(env === 'production' ? [
      new CopyPlugin([
        {
          from: path.resolve(__dirname, 'src', 'templates', '_redirects'),
        },
      ]),
    ] : []),
  ],
});
