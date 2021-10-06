const { chdir } = require("process")

require("./tilify/gulpfile")
chdir("pcu")
require("./pcu/gulpfile.babel")
