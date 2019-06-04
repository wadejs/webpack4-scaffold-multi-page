const CleanWebpackPlugin = require('clean-webpack-plugin')
const webpack = require('webpack')

module.exports = {
  mode: 'production',
  plugins: [
    /**
     * @description 在js文件开头加上相关信息
     */
    new webpack.BannerPlugin(`
@Author: wadejs
@GitHub: 'https://github.com/wadejs'
@Blog: 'http://blog.wadejs.cn'
@juejin: 'https://juejin.im/user/5ab999356fb9a028d6642c2a'
    `),
    new CleanWebpackPlugin()
  ]
}
