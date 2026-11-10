const { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } = require("node:fs");
const { tmpdir } = require("node:os");
const { join, resolve } = require("node:path");
const { spawnSync } = require("node:child_process");

const script = resolve(__dirname, "../scripts/configure-ci-android.cjs");
const fixture = `android {
    applicationId 'dev.arial.vocabulaire'
    signingConfigs {
        debug { }
    }
    release {
            signingConfig signingConfigs.debug
            def enableShrinkResources = false
    }
}`;
let directory;
let gradle;

beforeEach(() => {
  directory = mkdtempSync(join(tmpdir(), "vocab-ci-signing-"));
  gradle = join(directory, "android/app/build.gradle");
  mkdirSync(join(directory, "android/app"), { recursive: true });
  writeFileSync(gradle, fixture);
});

afterEach(() => rmSync(directory, { recursive: true, force: true }));

function configure(env) {
  return spawnSync(process.execPath, [script], {
    cwd: directory,
    env: { PATH: process.env.PATH, ...env },
    encoding: "utf8",
  });
}

test("release configuration fails closed when signing credentials are missing", () => {
  const result = configure({ CI_APK_VARIANT: "release" });
  expect(result.status).not.toBe(0);
  expect(readFileSync(gradle, "utf8")).toBe(fixture);
});

test("release configuration uses supplied credentials instead of the debug key", () => {
  const result = configure({
    CI_APK_VARIANT: "release",
    CI_KEYSTORE_PATH: "/tmp/test-key",
    CI_KEYSTORE_PASSWORD: "test-store-password",
    CI_KEY_ALIAS: "test-alias",
    CI_KEY_PASSWORD: "test-key-password",
  });
  const output = readFileSync(gradle, "utf8");
  expect(result.status).toBe(0);
  expect(output).toContain("signingConfig signingConfigs.ciRelease");
  expect(output).toContain("System.getenv('CI_KEYSTORE_PASSWORD')");
  expect(output).not.toContain("test-store-password");
});

test("preview configuration uses an isolated application ID", () => {
  const result = configure({ CI_APK_VARIANT: "preview" });
  expect(result.status).toBe(0);
  expect(readFileSync(gradle, "utf8")).toContain("applicationId 'dev.arial.vocabulaire.preview'");
});
