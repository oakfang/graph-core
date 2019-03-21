# @xgraph/core

### A core graph data structure: multiedged, directed and cyclic

## API

### class:Graph()

Create a new instance of a Graph.

### Graph::setVertex(id: string, type:string, props={})

Set a vertex (create or update) with an `id` and a `type`.

```js
g.setVertex('foo', 'Person', { name: 'Foo Bar', age: 23 });
```

### Graph::vertex(id:string)

Get a vertex by its `id`.

```js
g.vertex('foo').name === 'Foo Bar';
```

### Graph::hasVertex(id:string)

Check if a vertex exists by its `id`.

```js
g.hasVertex('foo') === true;
```

### Graph::removeVertex(id:string)

Remove a vertex by its `id` and all of its edges.
Returns all of the discarded edges.

```js
g.removeVertex('foo');
```

### Graph::setEdge(originVertexId:string, targetVertexId:string, type:string, properties={})

Ensure an edge of type `type` from vertex `origin` to vertex `target`.

```js
g.setEdge('foo', 'bar', 'friendOf');
```

### Graph::edge(originVertexId:string, targetVertexId:string, type:string)

Get the `type` edge from `origin` to `target` if exists, `null` otherwise.

```js
g.edge('foo', 'bar', 'friendOf').type === 'friends';
g.edge('foo', 'bar', 'father') === null;
```

### Graph::hasEdge(originVertexId:string, targetVertexId:string, type:string)

Check if a `type` edge from `origin` to `target` exists.

```js
g.hasEdge('foo', 'bar', 'friendOf') === true;
```

### Graph::removeEdge(originVertexId:string, targetVertexId:string, type:string)

Remove a `type` edge from `origin` to `target`.

```js
g.removeEdge('foo', 'bar', 'friendOf');
```

### Graph::inEdges(targetVertexId:string), Graph::outEdges(originVertexId:string), Graph::interEdges(originVertexId:string, targetVertexId:string), Graph::allEdges(vertexId:string)

Get all edges to `target`, all edges from `origin`, all edges from `origin` to `target`, all edges involving `vertexId` - respectively.

### Graph::vertices(type:string?)

An `iterator` over all the graph's vertices.

### Graph::toObject(), Graph.fromObject(bareObject)

Serialize and de-serialize the graph

## Usage

```js
const Graph = require('@xgraph/core');
const g = new Graph();

g.setVertex('foo', 'Person', { name: 'Foo Bar', age: 23 });
g.setVertex('bar', 'Person', { name: 'Bar Bar', age: 22 });
g.setEdge('foo', 'bar', 'friendOf');
g.outEdges('foo')
  .filter(({ type }) => type === 'friendsOf')
  .map(({ target }) => g.vertex(target).age); // [22]
```

## Advnced Usage - Indexing

Should you wish to, you may add (and remove) Indices for better querying performances.

### Graph::addIndex(prop:string, type?:string)

Create an Index for `prop`, possibly limited to only vertices of type `type`.
_Notice:_ creating an index of property `prop` drops any existing index of that property.

### Graph::dropIndex(prop:string)

Drop any existing Index for property `prop`;

### Graph::hasIndex(prop:string)

Return whether or not an Index for property `prop` exists.

### Graph::vertices(searchObject)

When using Indices, you may pass the `vertices` method an object of type:

```ts
type IndexValuePredicate = (value: Primitive) => boolean;
type IndexValue = Primitive | IndexValuePredicate;
type SearchObject = {
  [indexedProperty: string]: IndexValue;
};
```

The returned values are assured to satisfy all searched Indices.

### Benchmarks

```
Benchmarks for 1000000 vertices:
Setup [no initial Index]: 1781.846ms
Setup [with initial index]: 2566.437ms
Querying over all vertices, 50 times [no index]: 1286.428ms
Creating an index for all vertices: 398.959ms
Querying over all vertices, 50 times [with index]: 1.275ms
```
