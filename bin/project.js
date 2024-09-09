import YAML from 'yaml';
import { readFileSync } from 'node:fs';
import { exec } from 'node:child_process';
import { BatchBuilder } from '../index.js';
import commandLineArgs from 'command-line-args';

let mergeOptions;
const mainDefinitions = [{ name: 'command', defaultOption: true }];
const mainOptions = commandLineArgs(mainDefinitions, { stopAtFirstUnknown: true })
const argv = mainOptions._unknown || [];

if (mainOptions.command === 'build') {
  const mergeDefinitions = [
    { name: 'file', alias: 'f' }
  ];
  mergeOptions = commandLineArgs(mergeDefinitions, { argv });
} else {
    console.log('Unknown command!');
}

console.log(`proceed build --file ${mergeOptions.file}`);
const file = readFileSync(mergeOptions.file, 'utf8');
const tree = YAML.parse(file);

const cl = (node) => {
  exec(node.command, (error, stdout, stderr) => {
    if (error) {
      console.log(`running command "${node.command}" returned the error:`);
      console.log(error.message);
      return;
    }

    if (stderr) {
      console.log(`command "${node.command}" was failed`);
      console.log(stderr);
      return;
    }

    console.log(`${stdout}`);
  });
}

let builder = new BatchBuilder(tree, cl);
builder.build();
