var Promise = require("bluebird"),
    fs = Promise.promisifyAll(require('fs-extra')),
    os = require("os"),
    osType = os.type();

var rootDir = __dirname.replace(/cx_fed_cli\/lib/,"cx_fed_cli/");
if(osType == 'Windows_NT'){
	rootDir = __dirname.replace(/lib/,"");
}

function generateStructure(project){
  return fs.copyAsync(rootDir + 'simple-project', project,{clobber: true})
    .then(function(err){
      return err ? console.error(err) : console.log('创建成功');
    })
}

module.exports = generateStructure;