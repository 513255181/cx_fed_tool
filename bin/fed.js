#!/usr/bin/env node

var program = require('commander'),
	gs = require('../lib/generateStructure'),
	projcetType;

program
	.version(require('../package.json').version)
	.command('init <projcetName>')
	.description('创建一个项目')
	.action(function(projectName){
		if(program.mediumProject){
			projcetType = 'simple-project';
		}
		CreateProject(projectName,projcetType);
	});

program
	.option('--medium-project','创建一个中型项目');

program.parse(process.argv);

var pname = program.args[0];
	if(!pname) program.help();



function CreateProject(projectName,projcetType){
	console.log(projcetType);
	gs(projectName);
}