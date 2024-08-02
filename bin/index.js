#! /usr/bin/env node

const YAML = require('yaml');
const fs = require('node:fs');
const commandLineArgs = require('command-line-args');
const { BatchBuilder } = require('../builder');

let mergeOptions;
const mainDefinitions = [
  { name: 'command', defaultOption: true }
]
const mainOptions = commandLineArgs(mainDefinitions, { stopAtFirstUnknown: true })
const argv = mainOptions._unknown || [];

if (mainOptions.command === 'build') {
  const mergeDefinitions = [
    { name: 'file', alias: 'f' }
  ];
  mergeOptions = commandLineArgs(mergeDefinitions, { argv });
} else {
	console.log('Unknown command!');
	return;
}

console.log(`proceed build --file ${mergeOptions.file}`);
const file = fs.readFileSync(mergeOptions.file, 'utf8');
const tree = YAML.parse(file); 

let builder = new BatchBuilder(tree);
builder.build();