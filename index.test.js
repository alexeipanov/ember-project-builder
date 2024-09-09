import { RouteNode, RouteBuilder, BatchBuilder } from './index.cjs';
import { describe, expect, test } from '@jest/globals';

const tree = {
  routes: [
    { 'countries': {
        path: 'c1',
        'skip-router': true,
        routes: [
          { 'cities': {
              routes: [
                { 'streets': {
                    path: 'city-streets',
                    'reset-namespace': true
                  }
                }
              ],
              path: 'c2',
            }
          }
        ]
      }
    },
    { 'currencies': {
        path: 'c3'
      }
    },
    'languages'
  ]
};

let builder = new BatchBuilder(tree);

describe('Node resolution', () => {
  test('Object node', () => {
    let node = new RouteNode(builder.routes.at(0));
    expect(node.key).toBe('countries');
    expect(node.value).toEqual(builder.routes.at(0)['countries']);
  });

  test('Object node with params', () => {
    let node = new RouteNode(builder.routes.at(1));
    expect(node.key).toBe('currencies');
    expect(node.value).toBe(builder.routes.at(1)['currencies']);
  });

  test('String node', () => {
    let node = new RouteNode(builder.routes.at(2));
    expect(node.key).toBe('languages');
    expect(node.value).toBe(null);
  });
});

describe('Child node', () => {
  test('Object node', () => {
    let node = new RouteNode(builder.routes.at(0));
    expect(node.hasChild).toBe(true);
  });

  test('Object node with params', () => {
    let node = new RouteNode(builder.routes.at(1));
    expect(node.hasChild).toBe(false);
  });

  test('String node', () => {
    let node = new RouteNode(builder.routes.at(2));
    expect(node.hasChild).toBe(false);
  });

  test('Object node', () => {
    let node = new RouteNode(builder.routes.at(0));
    expect(node.childNode).toBe(builder.routes.at(0)['countries']['routes']);
  });

  test('Object node with params', () => {
    let node = new RouteNode(builder.routes.at(1));
    expect(node.childNode).toBe(null);
  });

  test('String node', () => {
    let node = new RouteNode(builder.routes.at(2));
    expect(node.childNode).toBe(null);
  });
});

describe('Node params', () => {
  test('Object node', () => {
    let node = new RouteNode(builder.routes.at(0));
    expect(node.params).toEqual([['path', 'c1'], ['skip-router', true]]);
  });

  test('Object node with params', () => {
    let node = new RouteNode(builder.routes.at(1));
    expect(node.params).toEqual(Object.entries(builder.routes.at(1)['currencies']));
  });

  test('String node', () => {
    let node = new RouteNode(builder.routes.at(2));
    expect(node.params).toEqual([]);
  });
});

describe('Route walking', () => {
  let builder = new RouteBuilder(tree);
  let routes = builder.walk(tree.routes);
  let nodes = [];
  for (let route of routes) {
    nodes.push(route);
  }

  test('Object node', () => {
    expect(nodes.length).toBe(5);
    expect(nodes.at(0).key).toBe('countries');
    expect(nodes.at(0).path).toBe('');
    expect(nodes.at(0).options).toBe('--path=c1 --skip-router=true');
    expect(nodes.at(0).command).toBe('flock app/router.js ember g route countries --path=c1 --skip-router=true');

    expect(nodes.at(1).key).toBe('cities');
    expect(nodes.at(1).path).toBe('countries/');
    expect(nodes.at(1).options).toBe('--path=c2');
    expect(nodes.at(1).command).toBe('flock app/router.js ember g route countries/cities --path=c2');

    expect(nodes.at(2).key).toBe('streets');
    expect(nodes.at(2).path).toBe('countries/cities/');
    expect(nodes.at(2).options).toBe('--path=city-streets --reset-namespace=true');
    expect(nodes.at(2).command).toBe('flock app/router.js ember g route countries/cities/streets --path=city-streets --reset-namespace=true');

    expect(nodes.at(3).key).toBe('currencies');
    expect(nodes.at(3).path).toBe('');
    expect(nodes.at(3).options).toBe('--path=c3');
    expect(nodes.at(3).command).toBe('flock app/router.js ember g route currencies --path=c3');

    expect(nodes.at(4).key).toBe('languages');
    expect(nodes.at(4).path).toBe('');
    expect(nodes.at(4).options).toBe('');
    expect(nodes.at(4).command).toBe('flock app/router.js ember g route languages');
  });
});

