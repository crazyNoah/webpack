var webpack = require("webpack");
var WebpackDevServer = require('webpack-dev-server');
var path = require("path");
var HtmlWebpackPlugin = require('html-webpack-plugin');

// css sprite plugin
var SpritesmithPlugin = require('webpack-spritesmith');

var hotHMRScript = 'webpack-hot-middleware/client?path=/__webpack_hmr&timeout=20000&reload=true'
var config = {
    context: __dirname,
    entry: {
      // vendor: ['jquery', "webpack-dev-server/client?http://localhost:8080/", "webpack/hot/dev-server"],
    },
    output: {
        path: path.join(__dirname, "dist"),
        publicPath: "/dist/", // relative path for github pages
        filename: "js/[name].js", // no hash in main.js because index.html is a static page
        chunkFilename: 'chunk/[name].[chunkhash:5].js',
    },
    // recordsOutputPath: path.join(__dirname, "records.json"),
    module: {
        loaders: [{
          test: /\.js?$/,
          exclude: /(node_modules|bower_components)/,
          loader: 'babel', // 'babel-loader' is also a legal name to reference
          query: {
            presets: ['es2015'],
            plugins: ["transform-object-assign"]
          }
        }, {
          test: /\.scss$/,
          loader: "style!css!sass"
        }, {
          test: /\.css$/,
          loader: "style!css"
        }, {
          test: /\.png|\.jepg|\.jpg|\.gif/,
          loader: 'url-loader?limit=8000&name=imgs/[name].[ext]'
        }, {
          test: /\.ejs/,
          loader: 'ejs-compiled'
        }, {
          test: path.join(__dirname, 'src/libs/jquery-2.1.3.min.js'),
          loader: 'expose?jQuery'
        }],
        noParse: [],    },
    devtool: "source-map",
    externals: {
        //don't bundle the 'react' npm package with our bundle.js
        //but get it from a global 'React' variable
    },
    resolve: {
        alias: {
          'jquery':path.join(__dirname, 'src/libs/jquery.2.1.3.min.js')
        }
    },
    plugins: [
      new webpack.DefinePlugin({
        'process.env': {
          'NODE_ENV': '"development"'
        },
        // $: 'jquery',
        // jQuery: 'jquery'
      }),
      // new webpack.optimize.CommonsChunkPlugin(),
      new webpack.optimize.LimitChunkCountPlugin({ maxChunks: 20 }),
      new webpack.optimize.OccurenceOrderPlugin(),
      new webpack.HotModuleReplacementPlugin(),
      new webpack.NoErrorsPlugin(),
      new SpritesmithPlugin({
        src: {
          cwd: path.resolve(__dirname, 'src/imgs/sprites'),
          glob: '*.png'
        },
        target: {
          image: path.resolve(__dirname, 'src/imgs/sprites.png'),
          css: path.resolve(__dirname, 'src/sass/sprite.scss')
        },
        apiOptions: {
          cssImageRef: "/src/imgs/sprites.png"
        }
      }),
    ],
    fakeUpdateVersion: 0
};

// 增加entry和html plugin
var addEntryToConfig = require('./webpackConf/addEntryToConfig');
config = addEntryToConfig(config, true);



module.exports = config;
