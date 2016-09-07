var webpack = require("webpack");

var glob = require('glob');
var path = require('path');
var HtmlWebpackPlugin = require('html-webpack-plugin');

var hotHMRScript = 'webpack-hot-middleware/client?path=/__webpack_hmr&timeout=20000&reload=true'

function addEntryToConfig(config, isDev) {

  var files = glob.sync('src/views/**/*.ejs', {ignore: 'src/views/common/*.ejs'})
  // 上线时，将通用js打包到vendorjs中
  var commonChunks = [];
  files.forEach((file, index) => {
    // 获取当前文件名
    var filename = path.basename(file, '.ejs');
    var dir = path.dirname(file).replace('src/views', '');

    // 写入entry
    var chunkName = dir + path.sep + filename;
    var chunkDir = './src/js' + chunkName + '.js';
    var entryName = chunkName.replace('/', '');
    config.entry[entryName] = isDev ? [chunkDir, "webpack-dev-server/client?http://localhost:8080/", "webpack/hot/dev-server"] : [chunkDir];
    // config.entry[entryName] = isDev ? [hotHMRScript, chunkDir] : [chunkDir];

    var HtmlWebpackPluginChunks = isDev ? [entryName] : [entryName, 'common']
    // 给每一个入口文件都增加HtmlWebpackPlugin配置
    var htmlPlugin = new HtmlWebpackPlugin({
      filename: 'pages/' + dir + path.sep + filename + '.html',
      template: file,
      chunks: HtmlWebpackPluginChunks,
      minify: { //压缩HTML文件
        removeComments: true, //移除HTML中的注释
        collapseWhitespace: true //删除空白符与换行符
      }
    });
    config.plugins.push(htmlPlugin);

    // 增加CommonsChunkPlugin配置
    if (!isDev) {
      commonChunks.push(entryName);
    }
    // console.log(entryName)

  });
  // console.log(commonChunks)
  if (!isDev) {
    config.plugins.push(new webpack.optimize.CommonsChunkPlugin({
      name: 'common',
      chunks: commonChunks,
      minChunks: 3,
      filename: 'js/common/[name].[chunkhash:5].js'
    }));
  }
  // console.log(config.plugins)
  return config;
}

module.exports = addEntryToConfig;
