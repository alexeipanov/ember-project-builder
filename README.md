# ember-project-builder
Generates your project scaffold running blueprints from your yml file

## Compatibility

* Ember.js v4.8 or above
* Ember CLI v4.8 or above
* Node.js v18 or above

## Requirements
- You'll need to have `flock` command available on your machine.

- The script should be running from the Ember project directory.


## Installation

```
pnpm add -D ember-project-builder
```


## Usage

```
pnpm project build --file=project.yml
```

### project.yml file format
On the top level, you can use these keys:
`routes`, `models`, `controllers`, `templates`, and `components`<br/>
each of these should be an array containing items.

Item can be just a string:
```
controllers:
  - application
```

or an object:

```
routes:
  - countries:
      "reset-namespace": true
```
you can run `ember g <blueprint> --help`
to getting options available


Items can be nested:
```
routes:
  - countries:
      routes:
        - cities
```

or

```
models:
  - city:
      name: string
      isCapital: boolean
      foundedAt: date
      models:
        - street:
            name: string
```

Putting line `"lintFix": false` to the .ember-cli file will drastically speed up running the task.

You can put common options for each item (as well as for blueprint-specific options),<br/> but I think `.ember-cli` file is a better place to do it:

```
// .ember-cli
{
  /**
    Setting `isTypeScriptProject` to true will force the blueprint generators to generate TypeScript
    rather than JavaScript by default, when a TypeScript version of a given blueprint is available.
  */
  "isTypeScriptProject": false,
  "lintFix": false,
  "dryRun": true,
  "componentClass": "@glimmer/component"
}
```


## License

This project is licensed under the [MIT License](LICENSE.md).
