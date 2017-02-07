var path = require('path');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var webpack = require('webpack');
var hotMiddlewareScript = 'webpack-hot-middleware/client?reload=true';
var publicPath = 'http://localhost:8880/';
var glob = require('glob');


var files = glob.sync("./resources/tpl/*.page.pug")
var entrys = {};
var pages = [];
files.forEach(function(val){
  var name = val.slice(16, -9);
  pages.push(name);
  entrys[name] = [val, hotMiddlewareScript];
})

var webpackConfig = {
  entry: entrys,
  output: {
    path: path.resolve(__dirname, 'static'),
    publicPath: publicPath,
    filename: 'js/[name].[hash:7].js',
  },
  module: {
    loaders: [
      { test: /\.pug$/, loader: 'pug' },
      {
        test: /\.scss$/,
        loader: 'style!css!sass'
      }/*,
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        loader: 'url-loader',
        query: {
          limit: 10000,
          name: 'img/[name].[hash:7].[ext]',
          publicPath: 'static'
        }
      }*/
    ]
  },
  sassLoader: {
    sourceMap: true
  },
  devtool: '#eval-source-map',
  plugins: [
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.optimize.CommonsChunkPlugin('common.js', pages)
    /*,
    new HtmlWebpackPlugin({
      filename: 'detail.html',
      template: './resources/tpl/detail.jade',
    }),
    new HtmlWebpackPlugin({
      filename: 'cheap.html',
      template: './resources/tpl/detail_cheap.jade',
    })*/
    //使用循环方式new HtmlWebpackPlugin
  ]
};

module.exports = webpackConfig;

pages.forEach(function(pathname) {
  var conf = {
    filename: pathname + '.html',
    template: './resources/tpl/' + pathname + '.page.pug'
  };
  webpackConfig.plugins.push(new HtmlWebpackPlugin(conf))
})