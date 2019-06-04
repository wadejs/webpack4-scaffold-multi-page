module.exports = {
  mode: 'development',
  devtool: 'source-map',
  devServer: {
    host: '0.0.0.0',
    port: 8000,
    overlay: true,
    // noInfo: true,
    useLocalIp: true,
    proxy: {
      '/comments': {
        target: 'https://m.weibo.cn',
        changeOrigin: true,
        logLevel: 'debug'
      }
    },
    historyApiFallback: true
  }
}
