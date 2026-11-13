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
const { spawnSync } = require("node:child_process");

const script = resolve(__dirname, "../scripts/verify-ci-apk.sh");
let directory;
let bin;
let buildTools;

function executable(path, contents) {
  writeFileSync(path, `#!/bin/sh\n${contents}\n`);
  chmodSync(path, 0o755);
}

beforeEach(() => {
  directory = mkdtempSync(join(tmpdir(), "vocab-apk-artifact-"));
  bin = join(directory, "bin");
  buildTools = join(directory, "sdk/build-tools/37.0.0");
  mkdirSync(bin, { recursive: true });
  mkdirSync(buildTools, { recursive: true });
  mkdirSync(join(directory, "android/app/build/outputs/apk/release"), { recursive: true });
  writeFileSync(
    join(directory, "android/app/build/outputs/apk/release/app-release.apk"),
    "test APK",
  );
  executable(
    join(buildTools, "aapt"),
    `echo "package: name='$CI_APP_ID' versionCode='$CI_VERSION_CODE' versionName='$CI_VERSION_NAME'"`,
  );
  executable(
    join(buildTools, "apksigner"),
    "echo 'Number of signers: 1'\necho 'Signer #1 certificate SHA-256 digest: abc123'",
  );
  executable(join(bin, "unzip"), "echo 'lib/arm64-v8a/test.so'\necho 'lib/x86_64/test.so'");
  executable(join(bin, "sha256sum"), 'test -f "$1" || exit 1\nprintf "hash  %s\\n" "$1"');
});

afterEach(() => rmSync(directory, { recursive: true, force: true }));

function verify(variant, overrides = {}) {
  return spawnSync("bash", [script], {
    cwd: directory,
    encoding: "utf8",
    env: {
      ...process.env,
      PATH: `${bin}:${process.env.PATH}`,
      ANDROID_HOME: join(directory, "sdk"),
      CI_APK_VARIANT: variant,
      CI_APP_ID: "dev.arial.vocabulaire.preview",
      CI_VERSION_NAME: "1.2.3-pr.42.gabc1234",
      CI_VERSION_CODE: "1",
      CI_CERT_SHA256: "abc123",
      ...overrides,
    },
  });
}

test("names the preview APK and checksum with its version", () => {
  const result = verify("preview");
  expect(result.status).toBe(0);
  expect(
    readFileSync(
      join(directory, "android-artifact/vocabulaire-preview-1.2.3-pr.42.gabc1234.apk"),
      "utf8",
    ),
  ).toBe("test APK");
  expect(readFileSync(join(directory, "android-artifact/SHA256SUMS"), "utf8")).toContain(
    "vocabulaire-preview-1.2.3-pr.42.gabc1234.apk",
  );
});

test("keeps the release APK name used by CI artifacts", () => {
  const result = verify("release");
  expect(result.status).toBe(0);
  expect(readFileSync(join(directory, "android-artifact/vocabulaire-release.apk"), "utf8")).toBe(
    "test APK",
  );
  expect(readFileSync(join(directory, "android-artifact/SHA256SUMS"), "utf8")).toContain(
    "vocabulaire-release.apk",
  );
});

test("does not produce an artifact when the APK version differs", () => {
  executable(
    join(buildTools, "aapt"),
    `echo "package: name='$CI_APP_ID' versionCode='$CI_VERSION_CODE' versionName='wrong-version'"`,
  );
  const result = verify("preview");
  expect(result.status).not.toBe(0);
  expect(
    existsSync(join(directory, "android-artifact/vocabulaire-preview-1.2.3-pr.42.gabc1234.apk")),
  ).toBe(false);
});

test("does not produce a release artifact when its certificate differs", () => {
  const result = verify("release", { CI_CERT_SHA256: "wrong-certificate" });
  expect(result.status).not.toBe(0);
  expect(existsSync(join(directory, "android-artifact/vocabulaire-release.apk"))).toBe(false);
});
