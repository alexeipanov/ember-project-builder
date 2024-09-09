const YAML = require('yaml');
const fs = require('node:fs');
const { exec } = require('node:child_process');
const { BatchBuilder } = require('../index.cjs');
const commandLineArgs = require('command-line-args');

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
const file = fs.readFileSync(mergeOptions.file, 'utf8');
const tree = YAML.parse(file);

const cl = (node) => {
  exec(node.command, (error, stdout, stderr) => {
    if (error) {
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
