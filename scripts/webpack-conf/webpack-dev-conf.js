import path from 'path'
import webpack from 'webpack'
import merge from 'webpack-merge'
import getBaseConfig from './webpack-base-conf'

export default () => {
  var baseConfig = getBaseConfig('development')

  Object.keys(baseConfig.entry).forEach((name) => {
    baseConfig.entry[name] = [path.join(__dirname, 'webpack-dev-client')].concat(baseConfig.entry[name])
  })

  return merge(baseConfig, {
    cache: true,
    devtool: '#eval-source-map',
    output: {
      publicPath: '/'
    },
    plugins: [
      new webpack.HotModuleReplacementPlugin(),
      new webpack.NoErrorsPlugin()
    ]
  })
}
