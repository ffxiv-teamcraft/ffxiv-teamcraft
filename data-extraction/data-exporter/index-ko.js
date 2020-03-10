const { init, output, db } = require('./lib/common')

init(require('./config/ko'))
require('./task/index')

output('job-abbr', db('ClassJob').simpleObject('#3'))
