const { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } = require("node:fs");
const { tmpdir } = require("node:os");
const { delimiter, join, resolve } = require("node:path");
const { spawnSync } = require("node:child_process");

const script = resolve(__dirname, "../scripts/ci-android-smoke.sh");
let directory;
let trace;

beforeEach(() => {
  directory = mkdtempSync(join(tmpdir(), "vocab-ci-smoke-"));
  const bin = join(directory, "bin");
  trace = join(directory, "trace");
  mkdirSync(bin);
  writeFileSync(
    join(bin, "adb"),
    `#!/bin/sh
printf 'adb %s\\n' "$*" >> "$TRACE_FILE"
if [ "$1 $2 $3 $4" = 'shell -T pm clear' ]; then
  if [ "$CLEAR_RESULT" = failure ]; then printf 'Failure\\r\\n'; else printf 'Success\\r\\n'; fi
fi
`,
    { mode: 0o755 },
  );
  writeFileSync(join(bin, "maestro"), '#!/bin/sh\nprintf "maestro\\n" >> "$TRACE_FILE"\n', {
    mode: 0o755,
  });
});

afterEach(() => rmSync(directory, { recursive: true, force: true }));

function run(clearResult) {
  return spawnSync("bash", [script], {
    cwd: directory,
    env: {
      ...process.env,
      PATH: `${join(directory, "bin")}${delimiter}${process.env.PATH}`,
      TRACE_FILE: trace,
      CLEAR_RESULT: clearResult,
      CI_APP_ID: "dev.arial.vocabulaire.preview",
    },
    encoding: "utf8",
  });
}

test("clears the installed app before starting Maestro", () => {
  const result = run("success");
  const calls = readFileSync(trace, "utf8");
  expect(result.status).toBe(0);
  expect(calls).toContain("adb shell -T pm clear dev.arial.vocabulaire.preview");
  expect(calls.indexOf("adb shell -T pm clear")).toBeLessThan(calls.indexOf("maestro"));
});

test("fails and captures diagnostics when app data cannot be cleared", () => {
  const result = run("failure");
  const calls = readFileSync(trace, "utf8");
  expect(result.status).not.toBe(0);
  expect(calls).not.toContain("maestro");
  expect(calls).toContain("adb logcat -d -v threadtime");
});
