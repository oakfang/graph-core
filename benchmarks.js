const Graph = require('.');

const benchmark = (label, cb) => {
  console.time(label);
  cb();
  console.timeEnd(label);
};

function setupGraph(g) {
  Array.from({ length: 199999 }).forEach((_, idx) =>
    g.setVertex(`v${idx}`, 'Number')
  );
  g.setVertex('foo', 'Person', { name: 'foo' });
  g.setVertex('bar', 'Person', { name: 'bar' });
  g.setVertex('cat', 'Animal', { name: 'cat' });
  Array.from({ length: 199999 }).forEach((_, idx) =>
    g.setVertex(`v${idx}_1`, 'Number')
  );
  g.setVertex('home', 'Place', { name: 'Home' });
  g.setVertex('pt', 'Place', { name: 'Petah Tikva' });
  Array.from({ length: 199999 }).forEach((_, idx) =>
    g.setVertex(`v${idx}_2`, 'Number')
  );
  g.setEdge('foo', 'bar', 'friend');
  g.setEdge('bar', 'foo', 'friend');
  g.setEdge('bar', 'cat', 'owns-a');
  Array.from({ length: 199999 }).forEach((_, idx) =>
    g.setVertex(`v${idx}_3`, 'Number')
  );
  g.setEdge('bar', 'cat', 'likes-a');
  g.setEdge('foo', 'home', 'visited', { at: Date.now() });
  Array.from({ length: 199999 }).forEach((_, idx) =>
    g.setVertex(`v${idx}_4`, 'Number')
  );
}

const g = new Graph();
const gx = new Graph();

console.log(`Benchmarks for 1000000 vertices:`);

benchmark('Setup [no initial Index]', () => setupGraph(g));

benchmark('Setup [with initial index]', () => {
  gx.addIndex('name');
  setupGraph(gx);
});

benchmark('Querying over all vertices, 50 times [no index]', () => {
  for (let i = 0; i < 50; i++) {
    Array.from(g.vertices().filter(({ name }) => name && name.length === 3));
  }
});

benchmark('Creating an index for all vertices', () => g.addIndex('name'));

benchmark('Querying over all vertices, 50 times [with index]', () => {
  for (let i = 0; i < 50; i++) {
    Array.from(g.vertices({ name: name => name && name.length === 3 }));
  }
});
