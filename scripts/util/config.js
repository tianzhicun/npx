import extend from 'extend'
import path from 'path'
import fs from 'fs'
import configJson from '../../config.json'

var projectRoot = process.cwd()
var projectConf = {}

try {
  projectConf = fs.readFileSync('config.json', {
    encoding: 'utf8'
  })
  projectConf = JSON.parse(projectConf.toString())
} catch ( e ) {
  console.log('[warn] config.json not found at current path')
}

var config = extend(true, {}, configJson, projectConf)

export default (env) => {
  env = env || global.NODE_ENV || process.env.NODE_ENV
  var defaultConfig = config['default']
  var envConfig = extend(true, {}, defaultConfig, config[env || 'production'] || {}, {
    'process.env': env,
    ftp: config['ftp'],
    jsdoc: config['jsdoc'],
    postcss: config['postcss'],
    version: Date.now(),
    entryPrefixer: config['entryPrefixer'],
    webpack: config['webpack'] || {}
  })
  return envConfig
}
