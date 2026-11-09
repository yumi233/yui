const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const read = file => fs.readFileSync(path.join(__dirname, "..", file), "utf8");

test("components only style yui-* classes, native controls and dialogs", () => {
  const css = read("dist/components.css");
  const classes = new Set([...css.matchAll(/\.([a-z][\w-]*)/g)].map(m => m[1]).filter(name => !/^\d/.test(name) && !/^(css|w3|org)$/.test(name))); // css/w3/org come from data-URI text
  const foreign = [...classes].filter(name => !name.startsWith("yui-") && !["locale-switch", "fluid-indicator", "is-active", "is-open", "is-up"].includes(name));
  assert.deepEqual(foreign, []);
});

test("every class on the library page exists in components.css", () => {
  const page = read("index.html");
  const css = read("dist/components.css");
  const used = new Set([...page.matchAll(/class="([^"]+)"/g)].flatMap(m => m[1].split(/\s+/)).filter(name => name.startsWith("yui-")));
  assert.ok(used.size > 40);
  for (const name of used) assert.match(css, new RegExp(`\\.${name.replace(/[-_]/g, "\\$&")}(?![\\w-])`), `.${name} missing`);
});

test("tokens define both themes and the accent the rules tell projects to override", () => {
  const tokens = read("dist/tokens.css");
  assert.match(tokens, /\[data-theme="night"\]/);
  for (const name of ["--olive", "--sage", "--sage-soft", "--paper", "--surface", "--ink"]) assert.equal((tokens.match(new RegExp(`${name}:`, "g")) || []).length >= 2, true, name);
});

test("scripts are self-contained ES modules", () => {
  for (const file of ["dist/select.js", "dist/fluid-motion.js"]) assert.doesNotMatch(read(file), /^\s*import\s/m, file);
  assert.match(read("dist/select.js"), /yui:refresh/);
});

test("package exports every dist file", () => {
  const pkg = JSON.parse(read("package.json"));
  for (const file of fs.readdirSync(path.join(__dirname, "../dist"))) assert.ok(pkg.exports[`./${file}`], file);
});
