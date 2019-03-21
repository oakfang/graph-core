const Graph = require('.');
const g = new Graph();
const gx = new Graph();
console.time('Setup')
Array.from({ length: 20000 }).forEach((_, idx) =>
  g.setVertex(`v${idx}`, 'Number')
);
g.setVertex('foo', 'Person', { name: 'foo' });
g.setVertex('bar', 'Person', { name: 'bar' });
g.setVertex('cat', 'Animal', { name: 'cat' });
Array.from({ length: 20000 }).forEach((_, idx) =>
  g.setVertex(`v${idx}_1`, 'Number')
);
g.setVertex('home', 'Place', { name: 'Home' });
g.setVertex('pt', 'Place', { name: 'Petah Tikva' });
g.setEdge('foo', 'bar', 'friend');
g.setEdge('bar', 'foo', 'friend');
g.setEdge('bar', 'cat', 'owns-a');
Array.from({ length: 20000 }).forEach((_, idx) =>
  g.setVertex(`v${idx}_2`, 'Number')
);
g.setEdge('bar', 'cat', 'likes-a');
g.setEdge('foo', 'home', 'visited', { at: Date.now() });
Array.from({ length: 20000 }).forEach((_, idx) =>
  g.setVertex(`v${idx}_3`, 'Number')
);
console.timeEnd('Setup')

console.time('Setup with index')
gx.addIndex('name');
Array.from({ length: 20000 }).forEach((_, idx) =>
  gx.setVertex(`v${idx}`, 'Number')
);
gx.setVertex('foo', 'Person', { name: 'foo' });
gx.setVertex('bar', 'Person', { name: 'bar' });
gx.setVertex('cat', 'Animal', { name: 'cat' });
Array.from({ length: 20000 }).forEach((_, idx) =>
  gx.setVertex(`v${idx}_1`, 'Number')
);
gx.setVertex('home', 'Place', { name: 'Home' });
gx.setVertex('pt', 'Place', { name: 'Petah Tikva' });
gx.setEdge('foo', 'bar', 'friend');
gx.setEdge('bar', 'foo', 'friend');
gx.setEdge('bar', 'cat', 'owns-a');
Array.from({ length: 20000 }).forEach((_, idx) =>
  gx.setVertex(`v${idx}_2`, 'Number')
);
gx.setEdge('bar', 'cat', 'likes-a');
gx.setEdge('foo', 'home', 'visited', { at: Date.now() });
Array.from({ length: 20000 }).forEach((_, idx) =>
  gx.setVertex(`v${idx}_3`, 'Number')
);
console.timeEnd('Setup with index')

console.time('No index');
for (let i = 0; i < 5; i++) {
  Array.from(g.vertices().filter(({ name }) => name && name.length === 3));
}
console.timeEnd('No index');
console.time('Indexing');
g.addIndex('name');
console.timeEnd('Indexing');
console.time('With index');
for (let i = 0; i < 5; i++) {
  Array.from(g.vertices({ name: name => name && name.length === 3 }));
}
console.timeEnd('With index');

/**
 * No index: 28.737ms
 * Indexing: 26.318ms
 * With index: 0.610ms
 */