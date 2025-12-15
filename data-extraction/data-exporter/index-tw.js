const { init, output, db } = require('./lib/common')

init(require('./config/tw'))
require('./task/index')

