const iter = require('itercol');
const Index = require('./gindex');
const { ID, TYPE } = require('./common');

class Graph {
  constructor() {
    this._vertices = new Map();
    this._from = new WeakMap();
    this._to = new WeakMap();
    this._indices = { [TYPE]: new Index(TYPE) };
    this._verticesTypes = {};
  }

  static fromObject({ indices, vertices }) {
    const g = new Graph();
    const edges = vertices.reduce((allEdges, { id, type, vertex, edges }) => {
      g.setVertex(id, type, vertex);
      return allEdges.concat(edges);
    }, []);
    while (edges.length) {
      const { origin, target, type, properties } = edges.pop();
      g.setEdge(origin, target, type, properties);
    }
    for (let [type, prop] of indices) {
      g.addIndex(prop, type);
    }
    return g;
  }

  toObject() {
    return {
      indices: Object.keys(this._indices).map(idx => [
        this._indices[idx]._type,
        idx,
      ]),
      vertices: Array.from(
        this.vertices().map(v => ({
          id: v[ID],
          type: v[TYPE],
          vertex: v,
          edges: Array.from(
            this.outEdges(v[ID]).map(({ target, type, properties }) => ({
              origin: v[ID],
              target: target[ID],
              type,
              properties,
            }))
          ),
        }))
      ),
    };
  }

  addIndex(prop, type) {
    const index = new Index(prop, type);
    this._indices[prop] = index;
    for (let v of this._vertices.values()) {
      index.addVertex(v);
    }
  }

  dropIndex(prop) {
    delete this._indices[prop];
  }

  setVertex(id, type, props) {
    this._removeVertexFromIndices(this.vertex(id));
    const vertex = Object.freeze({
      [TYPE]: type,
      [ID]: id,
      id,
      type,
      ...props,
    });
    this._vertices.set(id, vertex);
    Reflect.ownKeys(this._indices).forEach(idx =>
      this._indices[idx].addVertex(vertex)
    );
  }

  vertex(id) {
    return this._vertices.get(id);
  }

  hasVertex(id) {
    return this._vertices.has(id);
  }

  _removeVertexFromIndices(v) {
    Object.values(this._indices).forEach(idx => idx.removeVertex(v));
  }

  _removeAllEdgesToVertex(v) {
    const verticesWithEdgesToV = this._to.get(v);
    if (verticesWithEdgesToV) {
      for (let origin of verticesWithEdgesToV) {
        this._from.get(origin).delete(v);
      }
    }
  }

  removeVertex(id) {
    const v = this.vertex(id);
    if (!v) return false;
    this._removeVertexFromIndices(v);
    this._removeAllEdgesToVertex(v);
    this._vertices.delete(id);
    return true;
  }

  setEdge(origin, target, type, properties = {}) {
    const vOrigin = this.vertex(origin);
    const vTarget = this.vertex(target);
    if (!vOrigin || !vTarget) return null;
    if (!this._from.has(vOrigin)) {
      this._from.set(vOrigin, new Map());
    }
    const fromEdges = this._from.get(vOrigin);
    if (!fromEdges.has(vTarget)) {
      fromEdges.set(vTarget, {});
    }
    if (!this._to.has(vTarget)) {
      this._to.set(vTarget, new Set());
    }
    this._to.get(vTarget).add(vOrigin);
    const edgesFromOriginToTarget = fromEdges.get(vTarget);
    properties = Object.freeze(properties);
    edgesFromOriginToTarget[type] = properties;
    return { origin: vOrigin, target: vTarget, type, properties };
  }

  removeEdge(origin, target, type) {
    const vOrigin = this.vertex(origin);
    const vTarget = this.vertex(target);
    if (!vOrigin || !vTarget) return;
    if (!this._from.has(vOrigin)) return;
    if (!this._from.get(vOrigin).has(vTarget)) return;
    const edges = this._from.get(vOrigin).get(vTarget);
    delete edges[type];
    if (!Object.keys(edges).length) {
      this._from.get(vOrigin).delete(vTarget);
      this._to.get(vTarget).delete(vOrigin);
    }
  }

  edge(origin, target, type) {
    const vOrigin = this.vertex(origin);
    const vTarget = this.vertex(target);
    if (!vOrigin || !vTarget) return;
    if (!this._from.has(vOrigin)) return null;
    const fromEdges = this._from.get(vOrigin);
    if (!fromEdges.has(vTarget)) return null;
    const toEdges = fromEdges.get(vTarget);
    if (!toEdges[type]) return null;
    const properties = toEdges[type];
    return { origin: vOrigin, target: vTarget, type, properties };
  }

  hasEdge(origin, target, type) {
    return this.edge(origin, target, type) ? true : false;
  }

  *_outEdges(origin) {
    for (const [target, types] of this._from.get(origin).entries()) {
      for (let type of Object.keys(types)) {
        yield {
          origin,
          target,
          type,
          properties: types[type],
        };
      }
    }
  }

  outEdges(origin) {
    const vOrigin = this.vertex(origin);
    if (!vOrigin) throw new Error(`No existing vertex ${origin}`);
    if (!this._from.has(vOrigin)) return iter([]);
    return iter(this._outEdges(vOrigin));
  }

  *_inEdges(target) {
    for (let origin of this._to.get(target)) {
      const types = this._from.get(origin).get(target);
      for (let type of Object.keys(types)) {
        yield {
          origin,
          target,
          type,
          properties: types[type],
        };
      }
    }
  }

  inEdges(target) {
    const vTarget = this.vertex(target);
    if (!vTarget) throw new Error(`No existing vertex ${target}`);
    if (!this._to.has(vTarget)) return iter([]);
    return iter(this._inEdges(vTarget));
  }

  interEdges(origin, target) {
    return this.outEdges(origin).filter(e => e.target[ID] === target);
  }

  *_allEdges(id) {
    yield* this.outEdges(id);
    yield* this.inEdges(id);
  }

  allEdges(id) {
    return iter(this._allEdges(id));
  }

  vertices(filter) {
    if (filter) {
      const stream =
        typeof filter === 'string'
          ? this._indices[TYPE].getEqIds(filter)
          : iter(
              Reflect.ownKeys(filter)
                .map(indexName => {
                  const method =
                    typeof filter[indexName] === 'function'
                      ? 'getIdsByPredicate'
                      : 'getEqIds';
                  return new Set(
                    this._indices[indexName][method](filter[indexName])
                  );
                })
                .reduce(
                  (intersection, ids) =>
                    new Set([...intersection].filter(id => ids.has(id)))
                )
            );
      return stream.map(id => this.vertex(id));
    }

    return iter(this._vertices.values());
  }
}

module.exports = Graph;
