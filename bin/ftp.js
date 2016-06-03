var scp = require('scp2')
var glob = require('glob')
var extend = require('extend')
var fs = require('fs')
var path = require('path')
var config = require('../config.json')
var packageConfig = require('../package.json')

var codePath = path.join(__dirname, '../')
var remotePath = path.resolve(config.ftp.remotePath, packageConfig.name)
var options = {
  port: 22,
  host: config.ftp.host,
  username: config.ftp.username,
  password: config.ftp.password
}

var client = new scp.Client(options)
var paths = []
var patterns = ['*', '.*']
var idx = 0
var time = Date.now()

patterns.forEach(function(pattern) {
  var _paths = glob.sync(pattern, {
    cwd: codePath,
    ignore: ['.git', '*.log*', 'node_modules', 'zip', 'log']
  })
  paths = paths.concat(_paths)
})

function step() {
  var local = path.resolve(codePath, paths[idx])
  var remote
  var stats = fs.statSync(local)
  if (stats.isFile()) {
    remote = path.dirname(path.resolve(remotePath, paths[idx]))
  } else if (stats.isDirectory()) {
    remote = path.resolve(remotePath, paths[idx])
  }

  return new Promise(function(resolve, reject) {
    scp.scp(local, extend(options, {
      path: remote
    }), function(err) {
      if (err) {
        console.error(err)
        reject()
      } else {
        console.log('[task ftp] ' + local + ' => ' + remote)
        resolve()
      }
    })
  })
}

function run() {
  return step()
    .then(function() {
      idx += 1
      if (idx < paths.length) {
        return run()
      } else {
        client.close()
        console.log('[task ftp] done in ' + (Date.now() - time) / 1000 + 's')
      }
    })
}

client.mkdir(remotePath, function() {
  if (paths.length) {
    run()
  }
})
