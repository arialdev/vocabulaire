const { spawnSync } = require("node:child_process");
const { createHash } = require("node:crypto");
const {
  chmodSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} = require("node:fs");
const { tmpdir } = require("node:os");
const { join, resolve } = require("node:path");

const workflow = readFileSync(resolve(__dirname, "../.github/workflows/release.yml"), "utf8");
const publicationStep = workflow
  .split("      - name: Publish verified release\n")[1]
  .split(/\n {6}- /, 1)[0];
const publicationScript = publicationStep
  .split("        run: |\n")[1]
  .split("\n")
  .filter((line) => line.startsWith("          "))
  .map((line) => line.slice(10))
  .join("\n");

let directory;
let bin;
let calls;

beforeEach(() => {
  directory = mkdtempSync(join(tmpdir(), "vocab-release-publication-"));
  bin = join(directory, "bin");
  calls = join(directory, "gh-calls.txt");
  mkdirSync(join(directory, "android-artifact"), { recursive: true });
  mkdirSync(join(directory, "notes"));
  mkdirSync(bin);
  writeFileSync(join(directory, "android-artifact/vocabulaire-release.apk"), "verified APK");
  const digest = createHash("sha256").update("verified APK").digest("hex");
  writeFileSync(
    join(directory, "android-artifact/SHA256SUMS"),
    `${digest}  vocabulaire-release.apk\n`,
  );
  writeFileSync(join(directory, "android-artifact/build-info.txt"), "build information\n");
  writeFileSync(join(directory, "notes/release-notes.md"), "release notes\n");
  writeFileSync(join(bin, "gh"), '#!/bin/sh\nprintf "%s\\n" "$@" >> "$GH_CALLS"\n');
  chmodSync(join(bin, "gh"), 0o755);
});

afterEach(() => rmSync(directory, { recursive: true, force: true }));

function publish(version, channel) {
  return spawnSync("bash", ["-e", "-c", publicationScript], {
    cwd: directory,
    encoding: "utf8",
    env: {
      ...process.env,
      PATH: `${bin}:${process.env.PATH}`,
      GH_CALLS: calls,
      GITHUB_REPOSITORY: "test/example",
      RELEASE_TAG: `v${version}`,
      RELEASE_VERSION: version,
      SOURCE_SHA: "a".repeat(40),
      RELEASE_CHANNEL: channel,
    },
  });
}

test.each([
  ["1.0.0-beta.1000001", "beta"],
  ["1.2.3", "stable"],
])("publishes versioned assets and title for %s", (version, channel) => {
  const result = publish(version, channel);
  expect(result.status).toBe(0);
  const apkName = `vocabulaire-${version}.apk`;
  expect(readFileSync(join(directory, "android-artifact", apkName), "utf8")).toBe("verified APK");
  expect(readFileSync(join(directory, "android-artifact/SHA256SUMS"), "utf8")).toBe(
    `${createHash("sha256").update("verified APK").digest("hex")}  ${apkName}\n`,
  );
  const args = readFileSync(calls, "utf8").split("\n");
  expect(args).toContain(`Vocabulaire ${version}`);
  expect(args).toContain(`android-artifact/${apkName}`);
  expect(args.includes("--prerelease")).toBe(channel === "beta");
});

test("does not create a tag when the downloaded APK checksum is incorrect", () => {
  writeFileSync(join(directory, "android-artifact/vocabulaire-release.apk"), "changed APK");
  const result = publish("1.2.3", "stable");
  expect(result.status).not.toBe(0);
  expect(existsSync(calls)).toBe(false);
});
