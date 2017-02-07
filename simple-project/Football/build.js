require('shelljs/global');

var path = require('path');
var webpack = require('webpack');

var webpackBuildConfig = require('./webpack.build.conf.js');

rm('-rf', 'dist/');
mkdir('dist');
cp('-R', './resources/common/', 'dist');
cp('-R', './resources/img/', 'dist/img/');


webpack(webpackBuildConfig, function (err, stats) {
  if (err) throw err
  process.stdout.write(stats.toString({
    colors: true,
    modules: false,
    children: false,
    chunks: false,
    chunkModules: false
  }) + '\n')
});