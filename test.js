const test = require("nefarious");
const Graph = require(".");

test.beforeEach(t => {
  const g = new Graph();
  g.setVertex("foo", "Person", { name: "foo" });
  g.setVertex("bar", "Person", { name: "bar" });
  g.setVertex("cat", "Animal", { name: "cat" });
  g.setVertex("home", "Place", { name: "Home" });
  g.setEdge("foo", "bar", "friend");
  g.setEdge("bar", "foo", "friend");
  g.setEdge("bar", "cat", "owns-a");
  g.setEdge("bar", "cat", "likes-a");
  g.setEdge("foo", "home", "visited", { at: Date.now() });
  t.context.g = g;
});

test("has vertex", t => {
  const { g } = t.context;
  t.is(g.hasVertex("foo"), true);
  t.is(g.hasVertex("bar"), true);
  t.is(g.hasVertex("cat"), true);
  t.is(g.hasVertex("meow"), false);
});

test("get vertex", t => {
  const { g } = t.context;
  t.is(g.vertex("foo").name, "foo");
  t.is(g.vertex("meow"), undefined);
});

test("set vertex", t => {
  const { g } = t.context;
  g.setVertex("foo", "Person", { name: "foo1" });
  t.is(g.vertex("foo").name, "foo1");
  g.setVertex("lolz", "Person");
  t.is(g.vertex("lolz")[Graph.TYPE], "Person");
});

test("has edge", t => {
  const { g } = t.context;
  t.is(g.hasEdge("foo", "bar", "friend"), true);
  t.is(g.hasEdge("foo", "bar", "hates"), false);
  t.is(g.hasEdge("foo", "barzor", "hates"), false);
});

test("get edge", t => {
  const { g } = t.context;
  const { origin, target, type } = g.edge("foo", "bar", "friend");
  t.is(origin.name, "foo");
  t.is(target.name, "bar");
  t.is(type, "friend");
  t.is(g.edge("foo", "cat", "lolz"), null);
  t.truthy(g.edge("foo", "home", "visited").properties.at < Date.now());
});

test("remove vertex", t => {
  const { g } = t.context;
  g.removeVertex("foo");
  t.is(g.vertex("foo"), undefined);
  t.is(g.hasEdge("foo", "bar", "friend"), false);
});

test("remove edge", t => {
  const { g } = t.context;
  g.removeEdge("bar", "cat", "owns-a");
  t.is(g.hasEdge("bar", "cat", "owns-a"), false);
  g.removeEdge("bar", "car", "owns-a");
  t.is(g.hasEdge("bar", "car", "owns-a"), false);
});

test("inter edges", t => {
  const { g } = t.context;
  t.is(Array.from(g.interEdges("bar", "cat")).length, 2);
});

test("all edges", t => {
  const { g } = t.context;
  t.is(Array.from(g.allEdges("bar")).length, 4);
});

test("vertices", t => {
  const { g } = t.context;
  const vs = g.vertices().filter(({ name }) => name.includes("a"));
  t.is(Array.from(vs).length, 2);
  const vst = g.vertices("Person").filter(({ name }) => name.includes("a"));
  t.is(Array.from(vst).length, 1);
});

test("to & from object", t => {
  const { g } = t.context;
  const bare = JSON.parse(JSON.stringify(g.toObject()));
  const g2 = Graph.fromObject(bare);
  t.truthy(g.edge("foo", "home", "visited").properties.at < Date.now());
});
