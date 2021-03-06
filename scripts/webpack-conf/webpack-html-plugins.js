import HtmlWebpackPlugin from 'html-webpack-plugin'
import glob from 'glob'
import path from 'path'
import chunks from './webpack-entry'
import getConfig from '../util/config'

var projectRoot = path.join(process.cwd(), 'client')
var entryPrefixer = getConfig().entryPrefixer || ''
var webpackNoCommon = getConfig().webpack['no-common'] || false

var chunkNames = []
for (let name in chunks) {
  chunkNames.push(name)
}

var minify = {
  // 行内元素内容至多保留一个空格
  collapseBooleanAttributes: true, // disabled="disabled" => disabled
  collapseInlineTagWhitespace: true, // display:inline element collapseWhitespace=true
  collapseWhitespace: true, // <div> <p>    foo </p>    </div> => <div><p>foo</p></div>
  conservativeCollapse: true, // collapse to 1 space (never remove it entirely)
  preserveLineBreaks: true, // collapse to 1 line break (never remove it entirely)

  quoteCharacter: '"',

  removeComments: true, // 删除注释
  removeScriptTypeAttributes: true, // remove type="text/javascript"
  removeStyleLinkTypeAttributes: true, // remove type="text/css"
  useShortDoctype: true // html5 doctype
}

var htmlsInFolders = glob.sync('!(partial)/**/*', {
  cwd: projectRoot + '/static/html'
})
var htmlsInCurDir = glob.sync('*.@(html|hbs)', {
  cwd: projectRoot + '/static/html'
})
var all = [].concat(htmlsInFolders, htmlsInCurDir)

var plugins = []

all.forEach((it) => {
  var withoutExt = it.replace(path.extname(it), '')
  var chunkMatch = chunkNames.find((chunk) => {
    return chunk === path.join('static/js', entryPrefixer + withoutExt).replace(/\\/g, '/')
  })

  var plugin = {}
  plugin.filename = withoutExt + '.html'
  plugin.template = 'static/html/' + it
  plugin.inject = true
  plugin.minify = minify
  if (chunkMatch) {
    plugin.chunks = [chunkMatch]
    if (!webpackNoCommon) {
      plugin.chunks.unshift('static/js/' + entryPrefixer + 'common')
    }
  } else {
    plugin.chunks = []
  }

  plugins.push(new HtmlWebpackPlugin(plugin))
})

export default plugins
