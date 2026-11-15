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
  for (const file of ["dist/select.js", "dist/fluid-motion.js", "dist/ascii.js"]) assert.doesNotMatch(read(file), /^\s*import\s/m, file);
  assert.match(read("dist/select.js"), /yui:refresh/);
});

test("package exports every dist file", () => {
  const pkg = JSON.parse(read("package.json"));
  for (const file of fs.readdirSync(path.join(__dirname, "../dist"))) assert.ok(pkg.exports[`./${file}`], file);
});

// ascii.js is an ES module in a CommonJS package; a data: URL lets Node 20 import it as one.
const ascii = () => import(`data:text/javascript;charset=utf-8,${encodeURIComponent(read("dist/ascii.js"))}`);
const pixels = (...rgba) => Uint8ClampedArray.from(rgba.flat());

test("ascii ramps start blank and fall back to the Han ramp", async () => {
  const { RAMPS, resolveRamp } = await ascii();
  for (const ramp of Object.values(RAMPS)) assert.equal(ramp[0].trim(), "");
  assert.deepEqual(resolveRamp("ascii"), { chars: RAMPS.ascii, wide: false });
  assert.deepEqual(resolveRamp("nope"), { chars: RAMPS.han, wide: true });
  assert.deepEqual(resolveRamp([" ", "x"]).chars, [" ", "x"]);
});

test("ascii density reads dark pixels as ink, light ones for masks, and nothing where it is transparent", async () => {
  const { cellDensity } = await ascii();
  const black = [0, 0, 0, 255], white = [255, 255, 255, 255], clear = [0, 0, 0, 0];
  // Two cells of 2 × 2 pixels side by side: the left all black, the right half white and half transparent.
  const data = pixels(black, black, white, clear, black, black, white, clear);
  assert.deepEqual([...cellDensity(data, 2, 1, 2, "dark")], [1, 0]);
  assert.deepEqual([...cellDensity(data, 2, 1, 2, "light")], [0, 0.5]);
});

test("ascii stretch spreads a flat picture over the whole ramp and leaves an even one alone", async () => {
  const { stretch } = await ascii();
  const flat = stretch(Float32Array.from({ length: 101 }, (_, i) => 0.4 + i * 0.002));
  assert.equal(flat[0], 0);
  assert.equal(flat[100], 1);
  assert.ok(Math.abs(flat[50] - 0.5) < 0.02);
  assert.deepEqual([...stretch(Float32Array.of(0.5, 0.5, 0.52))].map((v) => +v.toFixed(2)), [0.5, 0.5, 0.52]);
});
