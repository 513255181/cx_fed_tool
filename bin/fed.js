#!/usr/bin/env node

var program = require('commander');

program
	.version(require('../package.json').version)
	.usage('[options] [project name]')
	.option('-medium-project','创建你的中型项目')
	.parse(process.argv);

var pname = program.args[0]
if(!pname) program.help();

//gs(pname);