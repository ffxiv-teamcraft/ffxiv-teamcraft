const { init, output, db } = require('./lib/common')

init(require('./config/zh'))
require('./task/index')

