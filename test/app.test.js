const assert = require("node:assert/strict");
const { spawn } = require("node:child_process");
const http = require("node:http");
const test = require("node:test");

function get(port, path) {
  return new Promise((resolve, reject) => {
    const req = http.get({ hostname: "127.0.0.1", port, path }, (res) => {
      const chunks = [];
      res.on("data", (chunk) => chunks.push(chunk));
      res.on("end", () => {
        resolve({
          status: res.statusCode,
          body: Buffer.concat(chunks).toString(),
        });
      });
    });
    req.on("error", reject);
  });
}

async function waitFor(port) {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    try {
      const response = await get(port, "/live");
      if (response.status === 200) return;
    } catch (error) {
      // The process is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error("server did not become ready");
}

test("serves the main page and the probe endpoints", async (t) => {
  const port = 18081;
  const child = spawn(process.execPath, ["app.js"], {
    env: { ...process.env, PORT: String(port) },
    stdio: "ignore",
  });
  t.after(() => child.kill());

  await waitFor(port);

  const page = await get(port, "/my-app");
  assert.equal(page.status, 200);
  assert.equal(page.body, "Hello, World!");

  const ready = await get(port, "/ready");
  assert.equal(ready.status, 200);
  assert.equal(ready.body, "Ready");
});
