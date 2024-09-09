class Node {
  constructor(node, parents) {
    this.node = node;
    this.parents = parents;
  }

  get key() {
    if (typeof this.node === 'string') {
      return this.node;
    }

    if (typeof this.node === 'object') {
      return Object.keys(this.node).at(0);
    }

    return null;
  }

  get value() {
    if (typeof this.node === 'string') {
      return null;
    }

    if (typeof this.node === 'object') {
      return Object.values(this.node).at(0);
    }

    return null;
  }

  get params() {
    if (this.value) {
      return Object.entries(this.value).filter(([key]) => key !== this.nestedKey);
    }

    return [];
  }

  get hasChild() {
    if (this.value && Object.prototype.hasOwnProperty.call(this.value, this.nestedKey)) {
      return true;
    }

    return false;
  }

  get childNode() {
    if (this.hasChild) {
      return this.value[this.nestedKey];
    }

    return null;
  }

  get path() {
    return this.parents.length ? `${this.parents.join('/')}/` : '';
  }

  get options() {
    return this.params.map(([option, value]) => `--${option}=${value}`).join(' ');
  }
}

class RouteNode extends Node {
  constructor() {
    super(...arguments);
    this.nestedKey = 'routes';
  }

  get command() {
    return `flock app/router.js ember g route ${this.path}${this.key} ${this.options}`
      .trimEnd();
  }
};

class ModelNode extends Node {
  constructor() {
    super(...arguments);
    this.nestedKey = 'models';
  }

  get options() {
    return this.params.map(([option, value]) => `${option}:${value}`).join(' ');
  }

  get command() {
    return `ember g model ${this.path}${this.key} ${this.options}`;
  }
};

class ControllerNode extends Node {
  constructor() {
    super(...arguments);
    this.nestedKey = 'controllers';
  }

  get command() {
    return `ember g controller ${this.path}${this.key}`;
  }
};

class TemplateNode extends Node {
  constructor() {
    super(...arguments);
    this.nestedKey = 'templates';
  }

  get command() {
    return `ember g template ${this.path}${this.key}`;
  }
};

class ComponentNode extends Node {
  constructor() {
    super(...arguments);
    this.nestedKey = 'components';
  }

  get command() {
    return `ember g component ${this.path}${this.key}`;
  }
};

class GenericBuilder {
  *walk(nodes, parents = []) {
    for (let node of nodes) {
      let _node = new this.nodeClass(node, parents);
      yield _node;
      if (_node.hasChild) {
        yield* this.walk(_node.childNode, [...parents, _node.key]);
      }
    }
  }
}

class RouteBuilder extends GenericBuilder {
  constructor() {
    super(...arguments);
    this.nodeClass = RouteNode;
  }
}

class ControllerBuilder extends GenericBuilder {
  constructor() {
    super(...arguments);
    this.nodeClass = ControllerNode;
  }
}

class ModelBuilder extends GenericBuilder {
  constructor() {
    super(...arguments);
    this.nodeClass = ModelNode;
  }
}

class TemplateBuilder extends GenericBuilder {
  constructor() {
    super(...arguments);
    this.nodeClass = TemplateNode;
  }
}

class ComponentBuilder extends GenericBuilder {
  constructor() {
    super(...arguments);
    this.nodeClass = ComponentNode;
  }
}

class BatchBuilder {
  types = ['routes', 'models', 'controllers', 'templates', 'components']

  constructor(tree, cl) {
    this.execute = cl;
    const allowedEntries = Object.entries(tree).filter(([key]) => this.types.includes(key));
    Object.assign(this, Object.fromEntries(allowedEntries));
  }

  build() {
    if (Object.prototype.hasOwnProperty.call(this, 'routes')) {
      let routes = new RouteBuilder().walk(this.routes);
      for (let route of routes) {
        this.execute(route);
      }
    }

    if (Object.prototype.hasOwnProperty.call(this, 'models')) {
      let models = new ModelBuilder().walk(this.models);
      for (let model of models) {
        this.execute(model);
      }
    }

    if (Object.prototype.hasOwnProperty.call(this, 'controllers')) {
      let controllers = new ControllerBuilder().walk(this.controllers);
      for (let controller of controllers) {
        this.execute(controller);
      }
    }

    if (Object.prototype.hasOwnProperty.call(this, 'templates')) {
      let templates = new TemplateBuilder().walk(this.templates);
      for (let template of templates) {
        this.execute(template);
      }
    }

    if (Object.prototype.hasOwnProperty.call(this, 'components')) {
      let components = new ComponentBuilder().walk(this.components);
      for (let component of components) {
        this.execute(component);
      }
    }
  }
}

module.exports = { RouteNode, RouteBuilder, BatchBuilder };
