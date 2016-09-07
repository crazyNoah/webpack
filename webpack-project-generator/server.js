var config = require('./webpack.dev.config.js');
var webpack = require("webpack");
var WebpackDevServer = require('webpack-dev-server');
var exec = require('child_process').exec;
var fs = require('fs');
var path = require('path');

var compiler = webpack(config)

console.log(config.entry)

new WebpackDevServer(compiler, {
  publicPath: config.output.publicPath,
  stats: {
    colors: true
  },
  // 实现mock server的功能，可以自己扩展
  // @TODO 增加简单的mock功能
  proxy: {
    '/gov-admin/v1/*': {
      secure: false,
      bypass: function(req, res, proxyOptions) {
        // if (req.headers.accept.indexOf('application/json') > -1) {
          // 得到/gov-admin/v1/
          var reqSearch = proxyOptions.path.replace('*', '');
          // 请求的url地址，例: http://localhost:8080/gov-admin/v1/resources/list
          var reqUrl = req.url;
          // 转换成resources/list
          var reqPath = reqUrl.replace(reqSearch, '');
          if (reqPath.indexOf('?') > -1) {
            reqPath = reqPath.substr(0, reqPath.indexOf('?'))
          }
          // 获取真实目录
          var fileWithoutPostfix = './' + path.join("mockApi", reqPath);
          console.log('reqUrl', reqUrl);
          console.log('reqPath', reqPath)
          console.log('fileWithoutPostfix', fileWithoutPostfix)
          if (fs.existsSync(fileWithoutPostfix + '.json')) {
          // 返回.json文件
            return fileWithoutPostfix + '.json';
          } else {
            // 3.直接返回错误信息
            res.send('error');
          }
        // }
      }
    }
  }
}).listen(8080, "localhost", function(err) {
    if(err) {
      return console.log("webpack-dev-server", err);
    }
    console.log("[webpack-dev-server]", "http://localhost:8080/webpack-dev-server/dist/login.html");
});

console.log(module.hot)

// fs.watch('./src/views/', function() {
//     exec('webpack --config webpack.dev.config.js --progress --hide-modules', function(err, stdout, stderr) {
//         if (err) {
//             console.log(stderr);
//         } else {
//             console.log(stdout);
//         }
//     });
// });
