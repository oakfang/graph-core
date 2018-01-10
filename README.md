# graph-core
### A core graph data structure: multiedged, directed and cyclic

## API
### class:Graph()
Create a new instance of a Graph.

### Graph::setVertex(id, type, props={})
Set a vertex (create or update) with an `id` and a `type`.

```js
g.setVertex('foo', 'Person', {name: 'Foo Bar', age: 23});
```

### Graph::vertex(id)
Get a vertex by its `id`.

```js
g.vertex('foo').name === 'Foo Bar';
```

### Graph::hasVertex(id)
Check if a vertex exists by its `id`.

```js
g.hasVertex('foo') === true;
```

### Graph::removeVertex(id)
Remove a vertex by its `id` and all of its edges.
Returns all of the discarded edges.

```js
g.removeVertex('foo');
```

### Graph::setEdge(origin, target, type, properties={})
Ensure an edge of type `type` from vertex `origin` to vertex `target`.

```js
g.setEdge('foo', 'bar', 'friendOf');
```

### Graph::edge(origin, target, type)
Get the `type` edge from `origin` to `target` if exists, `null` otherwise.

```js
g.edge('foo', 'bar', 'friendOf').type === 'friends';
g.edge('foo', 'bar', 'father') === null;
```

### Graph::hasEdge(origin, target, type)
Check if a `type` edge from `origin` to `target` exists.

```js
g.hasEdge('foo', 'bar', 'friendOf') === true;
```

### Graph::removeEdge(origin, target, type)
Remove a `type` edge from `origin` to `target`.

```js
g.removeEdge('foo', 'bar', 'friendOf');
```

### Graph::inEdges(target), Graph::outEdges(origin), Graph::interEdges(origin, target), Graph::allEdges(vertexId)
Get all edges to `target`, all edges from `origin`, all edges from `origin` to `target`, all edges involving `vertexId` - respectively.

### Graph::vertices()
An `iterator` over all the graph's vertices.

### Graph::verticesByType(type)
An iterator over all the vertices of a given `type`.


## Usage
```js
'use strict';

const Graph = require('graph-core');
const g = new Graph();

g.setVertex('foo', 'Person', {name: 'Foo Bar', age: 23});
g.setVertex('bar', 'Person', {name: 'Bar Bar', age: 22});
g.setEdge('foo', 'bar', 'friendOf');
g.outEdge('foo')
 .filter(({type}) => type === 'friendsOf')
 .map(({target}) => g.vertex(target).age); // [22]
```