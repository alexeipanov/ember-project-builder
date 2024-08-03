const { exec } = require("child_process");

class Node {
  constructor(node) {
    this.node = node;
  }

  get pair() {
    if ((typeof this.node === 'string')) {
      return [this.node, null];
    }

    if (typeof this.node === 'object') {
      let [ pair ] = Object.entries(this.node);
      return pair;
    }
  }

  params(type) {
    let [key, value] = this.pair;
    if (!value) {
      return {};
    }

    return Object.entries(value).filter(([key]) => key !== type);
  }

  hasNested(type) {
    let [key, value] = this.pair;
    return value && Array.isArray(value[type]);
  }
}

class genericBuilder {
  walk(nodes, parents = []) {
    nodes.forEach((node) => {
      let entity = new Node(node);
      let [key, value] = entity.pair;
      this.build(key, parents, entity.params(this.type));
      if (entity.hasNested(this.type)) {
        this.walk(value[this.type], [...parents, key]);
      }
    });
  }

  path(parents = []) {
    return parents.length ? `${parents.join('/')}/` : '';
  }

  build(type, parents, params) {}

  run(command) {
    exec(command, (error, stdout, stderr) => {
      if (error) {
          console.log(error.message);
          return;
      }
      if (stderr) {
          console.log(stderr);
          return;
      }
      console.log(`${stdout}`);
    });
  }
}

class RouteBuilder extends genericBuilder {
  constructor() {
    super(...arguments);
    this.type = 'routes';
  }

  options(params) {
    let _params = Object.values(params);
    if (!_params.length) {
      return '';
    }

    return _params.reduce((command, [option, value]) => `${command} --${option}=${value}`, '');
  }

  build(route, parents, params) {
    this.run(`flock app/router.js ember g route ${this.path(parents)}${route} ${this.options(params)}`);
  }
}

class ControllerBuilder extends genericBuilder {
  constructor() {
    super(...arguments);
    this.type = 'controllers';
  }

  build(controller, parents) {
    this.run(`ember g controller ${this.path(parents)}${controller}`);
  }
}

class ModelBuilder extends genericBuilder {
  constructor() {
    super(...arguments);
    this.type = 'models';
  }

  options(params) {
    let _params = Object.values(params);
    if (!_params.length) {
      return '';
    }

    return _params.reduce((command, [option, value]) => `${command} ${option}:${value}`, '');
  }

  build(model, parents, params) {
    this.run(`ember g model ${this.path(parents)}${model} ${this.options(params)}`);
  }
}

class TemplateBuilder extends genericBuilder {
  constructor() {
    super(...arguments);
    this.type = 'templates';
  }

  build(template, parents) {
    this.run(`pnpm exec ember g template ${this.path(parents)}${template}`);
  }
}

class ComponentBuilder extends genericBuilder {
  constructor() {
    super(...arguments);
    this.type = 'components';
  }

  options(params) {
    let _params = Object.values(params);
    if (!_params.length) {
      return '';
    }

    return _params.reduce((command, [option, value]) => `${command} --${option}=${value}`, '');
  }

  build(component, parents, params) {
    this.run(`pnpm exec ember g component ${this.path(parents)}${component} ${this.options(params)}`);
  }
}

class BatchBuilder {
  types = ['routes', 'models', 'controllers', 'templates', 'components']

  constructor(yaml) {
    const allowedEntries = Object.entries(yaml).filter(([key]) => this.types.includes(key));
    Object.assign(this, Object.fromEntries(allowedEntries));
  }
  
  build() {
    if (this.hasOwnProperty('routes')) {
      new RouteBuilder().walk(this.routes);
    }

    if (this.hasOwnProperty('models')) {
      new ModelBuilder().walk(this.models);
    }

    if (this.hasOwnProperty('controllers')) {
      new ControllerBuilder().walk(this.controllers);
    }

    if (this.hasOwnProperty('templates')) {
      new TemplateBuilder().walk(this.templates);
    }

    if (this.hasOwnProperty('components')) {
      new ComponentBuilder().walk(this.components);
    }
  }
}

exports.BatchBuilder = BatchBuilder;
