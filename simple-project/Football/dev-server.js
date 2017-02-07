require('shelljs/global');

var path = require('path');
var express = require('express');
var webpack = require('webpack');
var webpackDevMiddleware = require('webpack-dev-middleware');
var webpackHotMiddleware = require('webpack-hot-middleware');
var webpackDevConfig = require('./webpack.dev.conf.js');

var port = 8880
rm('-rf', 'static/');
mkdir('static');
cp('-R', './resources/common/', 'static');
cp('-R', './resources/img/', 'static/img/');

var app = express()
var compiler = webpack(webpackDevConfig)

app.use(webpackDevMiddleware(compiler, {
  publicPath: webpackDevConfig.output.publicPath,
  stats: {
    colors: true,
    chunks: false
  }
}));

app.use(webpackHotMiddleware(compiler));
app.use(express.static('static'))

module.exports = app.listen(port, function (err) {
  if (err) {
    console.log(err)
    return
  }
  console.log('Listening at http://localhost:' + port + '\n')
})
