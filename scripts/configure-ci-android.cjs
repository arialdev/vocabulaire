// Configure the generated project only; Expo prebuild may replace android/.
const fs = require("node:fs");

const variant = process.env.CI_APK_VARIANT;
if (!["preview", "release"].includes(variant)) {
  throw new Error("CI_APK_VARIANT must be preview or release");
}

const path = "android/app/build.gradle";
let gradle = fs.readFileSync(path, "utf8");
function replaceOnce(before, after) {
  if (gradle.split(before).length !== 2) {
    throw new Error(`Expected exactly one occurrence of: ${before}`);
  }
  gradle = gradle.replace(before, after);
}

if (variant === "preview") {
  replaceOnce(
    "applicationId 'dev.arial.vocabulaire'",
    "applicationId 'dev.arial.vocabulaire.preview'",
  );
} else {
  for (const name of [
    "CI_KEYSTORE_PATH",
    "CI_KEYSTORE_PASSWORD",
    "CI_KEY_ALIAS",
    "CI_KEY_PASSWORD",
  ]) {
    if (!process.env[name]) throw new Error(`${name} is required for release signing`);
  }
  replaceOnce(
    "    signingConfigs {",
    `    signingConfigs {
        ciRelease {
            storeFile file(System.getenv('CI_KEYSTORE_PATH'))
            storePassword System.getenv('CI_KEYSTORE_PASSWORD')
            keyAlias System.getenv('CI_KEY_ALIAS')
            keyPassword System.getenv('CI_KEY_PASSWORD')
        }`,
  );
  replaceOnce(
    "signingConfig signingConfigs.debug\n            def enableShrinkResources",
    "signingConfig signingConfigs.ciRelease\n            def enableShrinkResources",
  );
}
fs.writeFileSync(path, gradle);
