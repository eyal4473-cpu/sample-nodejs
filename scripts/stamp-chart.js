const fs = require("node:fs");

const version = JSON.parse(fs.readFileSync("package.json", "utf8")).version;
const repository = process.env.IMAGE_REPOSITORY;

function rewrite(path, replacements) {
  const text = fs.readFileSync(path, "utf8").split("\n").map((line) => {
    for (const [prefix, value] of replacements) {
      if (line.startsWith(prefix)) return prefix + value;
    }
    return line;
  }).join("\n");
  fs.writeFileSync(path, text);
}

const valueReplacements = [["  tag: ", `"${version}"`]];
if (repository) valueReplacements.push(["  repository: ", repository]);

rewrite("chart/sample-nodejs/values.yaml", valueReplacements);
rewrite("chart/sample-nodejs/Chart.yaml", [
  ["version: ", version],
  ["appVersion: ", `"${version}"`],
]);
