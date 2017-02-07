#!/usr/bin/env node

var program = require('commander'),
	gs = require('../lib/generateStructure'),
	objLength = 0;

program
	.version(require('../package.json').version)
	.option('--medium-project','创建你的中型项目')
	.usage('[options] [project name]')
	.parse(process.argv);

for(var i in program){
	objLength++;
}

if(objLength <= 55){
	program.help();
}

if(program.mediumProject){
	var pname = program.args[0];
	if(!pname) program.help();
	gs(pname);
}