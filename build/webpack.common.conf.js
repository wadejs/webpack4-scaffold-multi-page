const path = require('path')
const webpack = require('webpack')
const merge = require('webpack-merge')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')

const productionConfig = require('./webpack.prod.conf.js') // 引入生产环境配置文件
const developmentConfig = require('./webpack.dev.conf.js') // 引入开发环境配置文件
const utils = require('./utils.js')
const cssHandler = [
  {
    loader: MiniCssExtractPlugin.loader,
    options: {
      // you can specify a publicPath here
      // by default it uses publicPath in webpackOptions.output
      publicPath: '/',
      hmr: process.env.NODE_ENV === 'development'
    }
  },
  {
    loader: 'css-loader'
  },
  {
    loader: 'postcss-loader',
    options: {
      sourceMap: process.env.NODE_ENV === 'development' ? true : false // 开发环境：开启source-map
    }
  }
]

/**
 * 根据不同的环境，生成不同的配置
 * @param {String} env "development" or "production"
 */
const baseConfig = {
  entry: utils.entries(),
  output: {
    path: path.resolve(__dirname, '..', 'dist'),
    filename: 'static/js/[name].[hash].js',
    chunkFilename: 'static/js/[name]-[hash:5].manifest.js'
  },
  resolve: {
    /**
     * @description 可以在引入资源时省略拓展名
     */
    extensions: ['.js', '.vue', '.json', '.styl', '.css', '.scss', '.less'],
    /**
     * @description 为模块设置别名，使引用时更加方便，只需引用这里设置的名字就好，不用写路径
     */
    alias: {
      /**
       * @description 给定对象的键后的末尾添加 $，以表示精准匹配;引入时只需要写vue
       */
      vue$: 'vue/dist/vue.esm.js',
      js: path.resolve(__dirname, '../src/assets/js/'),
      css: path.resolve(__dirname, '../src/assets/css/'),
      img: path.resolve(__dirname, '../src/assets/img/'),
      '@': path.resolve(__dirname, '../src/')
    }
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        vendor: {
          //抽离第三插件
          test: /node_module/,
          chunks: 'initial',
          name: 'vendor',
          priority: 10 //优先级
        },
        commons: {
          //抽离公共的js
          chunks: 'initial',
          name: 'commons',
          // minSize: 1 //只要超出0字节就生成新的公共的包
        }
      }
    }
  },
  module: {
    rules: [
      /**
       * @description 因为有些jquery插件需要用到全局的jq变量，通过expose-loader来把jquery暴露到全局
       * 这里只是起到把变量暴露到全局的作用，并不能自动引用相关的模块，所有需要手动引入模块或者通过webpack.ProvidePlugin插件自动引入
       */
      {
        test: require.resolve('jquery'),
        use: [
          {
            loader: 'expose-loader',
            options: 'jQuery'
          },
          {
            loader: 'expose-loader',
            options: '$'
          }
        ]
      },
      /**
       * @description js-loader
       */
      {
        test: /\.(jsx|js)$/,
        exclude: /(node_modules)/,
        use: [
          {
            loader: 'babel-loader'
          }
        ]
      },
      /**
       * @description 处理css
       */
      {
        test: /\.css$/,
        use: cssHandler
      },
      /**
       * @description 处理scss
       */
      {
        test: /\.scss$/,
        use: cssHandler.concat({
          loader: 'sass-loader'
        })
      },
      /**
       * @description 处理less
       */
      {
        test: /\.less$/,
        use: cssHandler.concat({
          loader: 'less-loader'
        })
      },
      /**
       * @description 处理stylus
       */
      {
        test: /\.styl$/,
        use: cssHandler.concat({
          loader: 'stylus-loader'
        })
      },
      /**
       * @description
       * 该loader用于打包图片或文件
       * outputPath定义图片或文件导出的目录（会自动生成）
       * css和html引用资源时会自动带上outputPath的路径
       */
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 8192,
              outputPath: 'static/imgs/' // 路径为dist下（根据output.path）
            }
          }
        ]
      },
      {
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          outputPath: 'static/imgs/' // 路径为dist下（根据output.path）
        }
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          outputPath: 'static/fonts/' // 路径为dist下（根据output.path）
        }
      },
      {
        test: /\.html$/,
        use: [
          {
            loader: 'html-loader',
            options: {
              minimize: true
            }
          }
        ]
      },
      /**
       * @description eslint
       * 这里匹配到的.html文件需要依赖html-loader或者html-withimg-loader才可使用
       */
      {
        test: /\.(html|js|vue)$/,
        enforce: 'pre',
        loader: 'eslint-loader',
        exclude: /node_modules/,
        options: {
          formatter: require('eslint-friendly-formatter') // 编译后错误报告格式
        }
      }
    ]
  },
  plugins: [
    /**
     * @description 提取css文件
     */
    new MiniCssExtractPlugin({
      filename: 'static/css/[name].min.css'
    }),
    // html模板
    // new HtmlWebpackPlugin({
    //   filename: 'index.html',
    //   template: path.resolve(__dirname, '..', 'index.html'),
    //   minify: {
    //     removeAttributeQuotes: true,
    //     removeComments: true,
    //     collapseWhitespace: true,
    //     removeScriptTypeAttributes: true,
    //     removeStyleLinkTypeAttributes: true
    //   },
    //   hash: true // 引用的资源文件是否加上hash值
    // }),
    /**
     * @description
     * 使用ProvidePlugin加载的模块在使用时将不再需要import和require进行引入;
     * 相当于在所有js里import和require引入了相关的库
     * 主要做的是代替用户引入模块的作用
     * 如果每个文件都要引用某个模块的话可以考虑使用这个插件
     * 这里定义的key就是为所有**模块**中可以使用的变量；但是这些变量在全局中是不存在的，如直接在控制台打印的话是不存在的；
     * 因为他们是被引用到各个单独的模块中的
     * 这里需要注意：通过这个插件引入的变量，eslint会报not defined 的错，
     * 需要处理一下
     * 在.eslintrc.js里配置一下EG. env.jquery = true
     */
    new webpack.ProvidePlugin({ $: 'jquery' }),
    /**
    * @description 将不经过打包的文件复制资源到产出目录
    */
    new CopyWebpackPlugin([{
      from: path.resolve(__dirname, '../src/public'),
      to: './public'
    }])
  ].concat(utils.htmlPlugin())
}

module.exports = env => {
  let config = env === 'production' ? productionConfig : developmentConfig
  return merge(baseConfig, config)
}
