#!/usr/bin/env node

var program = require('commander');

program
	.version(require('../package.json').version)
	.option('-mp,--medium-project','创建你的中型项目')
	.usage('[options] [project name]')
	.parse(process.argv);
	

var pname = program.args;
if(program.mediumProject){
	console.log('medium-project');
}
if(pname) program.help();

//gs(pname);