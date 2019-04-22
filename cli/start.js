const MiniTouch = require('../app/lib/MiniTouch')
const minimist = require('minimist')

var argv = minimist(process.argv.slice(2));

miniTouch = new MiniTouch(argv.s)
miniTouch.connect(() => {
  miniTouch.sendClick(10, 10)
})
