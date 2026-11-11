const { spawnSync, execFileSync } = require("node:child_process");
const {
  chmodSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} = require("node:fs");
const { tmpdir } = require("node:os");
const { join, resolve } = require("node:path");

const script = resolve(__dirname, "../scripts/prepare-android-release.sh");
let root;
let repo;
let bin;
let output;
let source;

function git(...args) {
  return execFileSync("git", args, { cwd: repo, encoding: "utf8" }).trim();
}

function commit(message) {
  git(
    "-c",
    "user.name=Test",
    "-c",
    "user.email=test@example.com",
    "commit",
    "--allow-empty",
    "-qm",
    message,
  );
}

function prepare(overrides = {}) {
  return spawnSync("bash", [script], {
    cwd: repo,
    encoding: "utf8",
    env: {
      ...process.env,
      PATH: `${bin}:${process.env.PATH}`,
      GITHUB_REF: "refs/heads/main",
      GITHUB_SHA: source,
      GITHUB_REPOSITORY: "test/example",
      GITHUB_RUN_NUMBER: "5",
      GITHUB_OUTPUT: output,
      RELEASE_CHANNEL: "stable",
      RELEASE_SOURCE: "",
      RELEASE_CLIFF_CONFIG: join(root, "cliff.toml"),
      MOCK_RELEASES: "[]",
      MOCK_INFO: "",
      MOCK_VERSION: "v1.0.0",
      ...overrides,
    },
  });
}

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), "vocab-release-"));
  repo = join(root, "repo");
  bin = join(root, "bin");
  output = join(root, "output");
  mkdirSync(join(repo, "scripts"), { recursive: true });
  mkdirSync(bin);
  writeFileSync(join(repo, "scripts/verify-ci-apk.sh"), "CI_VERSION_NAME\nCI_VERSION_CODE\n");
  writeFileSync(output, "");
  writeFileSync(
    join(bin, "gh"),
    '#!/bin/sh\ncase "$1 $2" in "release list") printf "%s\\n" "$MOCK_RELEASES" ;; "release download") printf "%s\\n" "$MOCK_INFO" ;; *) exit 2 ;; esac\n',
  );
  writeFileSync(
    join(bin, "git-cliff"),
    '#!/bin/sh\ncase "$*" in *--bumped-version*) printf "%s\\n" "$MOCK_VERSION" ;; *) echo "### Changes\n- feature" ;; esac\n',
  );
  chmodSync(join(bin, "gh"), 0o755);
  chmodSync(join(bin, "git-cliff"), 0o755);
  git("init", "-q");
  git("add", ".");
  commit("chore: initial");
  git("tag", "v1.0.0-beta");
  commit("feat: feature");
  source = git("rev-parse", "HEAD");
});

afterEach(() => rmSync(root, { recursive: true, force: true }));

test("prepares the first stable release and beta with the selected source", () => {
  const result = prepare({ RELEASE_CHANNEL: "beta" });
  expect(result.status).toBe(0);
  expect(readFileSync(output, "utf8")).toContain("version=1.0.0-beta.1000005");
  expect(readFileSync(output, "utf8")).toContain(`source_sha=${source}`);
  expect(readFileSync(join(repo, "release-notes.md"), "utf8")).toContain("feature");
});

test("rejects source commits outside main at dispatch", () => {
  commit("fix: newer");
  const result = prepare({ RELEASE_SOURCE: git("rev-parse", "HEAD") });
  expect(result.status).not.toBe(0);
  expect(result.stderr).toContain("Source is not on main at dispatch");
});

test("rejects a version code already distributed by a later release", () => {
  git("tag", "v1.0.0");
  const result = prepare({
    MOCK_RELEASES: JSON.stringify([{ tagName: "v1.0.0", isDraft: false, isPrerelease: false }]),
    MOCK_INFO: "version_code=1000010",
    MOCK_VERSION: "v1.0.1",
  });
  expect(result.status).not.toBe(0);
  expect(result.stderr).toContain("Version code is not newer");
});

test("rejects a tag reserved by an incomplete release", () => {
  const result = prepare({
    MOCK_RELEASES: JSON.stringify([{ tagName: "v1.0.0", isDraft: true, isPrerelease: false }]),
  });
  expect(result.status).not.toBe(0);
  expect(result.stderr).toContain("already exists");
});
