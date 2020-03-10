const { init, output, db } = require('./lib/common')

init(require('./config/zh'))
require('./task/index')

output('job-abbr', () => db('ClassJob').simpleObject('Name'))
