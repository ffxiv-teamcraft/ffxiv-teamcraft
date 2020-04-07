const { init, output, db } = require('./lib/common')

init(require('./config/global'))

output('ex-versions', () => db('ExVersion').simpleObject('Name'))
