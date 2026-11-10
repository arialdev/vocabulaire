# Android release signing

Create a new release keystore with Java `keytool -genkeypair -v -keystore <private-path>/vocabulaire-release.jks -alias vocabulaire -keyalg RSA -keysize 4096 -validity 10000`. Enter passwords interactively, not as command arguments. Back up the keystore, alias and both passwords securely outside GitHub and this repository. Never commit them or share them in logs. The old GitHub release used the same production application ID but its key was lost; Android cannot update that APK with the new key. Uninstalling it removes its local data. Later Google Play distribution may require a separate upload key or Play-managed signing key; verify its requirements before publishing.

Configure these GitHub Actions secrets before the first release build:

- `ANDROID_KEYSTORE_BASE64`: base64 encoding of the keystore, without line breaks.
- `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`, and `ANDROID_KEY_PASSWORD`: the keystore password, key alias and key password.
- `ANDROID_CERT_SHA256`: the SHA-256 certificate fingerprint printed by `keytool -list -v -keystore <keystore> -alias <alias>`.

Limit access to the secrets and protect `main`. The release build fails if credentials are absent or the resulting fingerprint does not match. Never pass production credentials to PR builds. Update Android's version code before distributing newer versions, and verify install/update behavior with the same signing certificate. For a future Play release, confirm the relationship between its app-signing and upload keys before distributing APKs.

### Updating Android signing secrets on macOS

GitHub does not show existing secret values. Keep the keystore, alias and passwords in a secure backup and password manager that you control. The commands below use macOS Terminal's default `zsh`, the GitHub CLI (`gh`), and the project-pinned Java toolchain. Run them from this checkout after `gh auth login`:

```sh
cd /Users/arialdev/.codex/worktrees/f35c/vocabulaire
GH_PAGER=cat gh secret list --repo arialdev/vocabulaire
```

If the checkout is elsewhere, change the first path to that checkout. To replace any of the five secrets, repeat the corresponding command below; `gh secret set` creates or overwrites the named secret. **Do not paste passwords or base64 keystore contents into chat, shell commands, logs or source files.**

1. To upload the existing or updated keystore, adjust the path if your secure copy is elsewhere. The file must be readable and nonempty:

   ```sh
   (set -o pipefail
   test -s "$HOME/Private/vocabulaire-signing/vocabulaire-release.jks" && \
     base64 -i "$HOME/Private/vocabulaire-signing/vocabulaire-release.jks" | \
     tr -d '\n' | gh secret set ANDROID_KEYSTORE_BASE64 --repo arialdev/vocabulaire)
   ```

2. Set the alias if it has changed. The current alias is `vocabulaire`:

   ```sh
   printf '%s' 'vocabulaire' | gh secret set ANDROID_KEY_ALIAS --repo arialdev/vocabulaire
   ```

3. To update either password, run its block and enter the corresponding value at the prompt. Input is hidden. If both passwords are the same, enter it twice:

   ```sh
   read -rs 'secret_value?Keystore password: '
   echo
   printf '%s' "$secret_value" | gh secret set ANDROID_KEYSTORE_PASSWORD --repo arialdev/vocabulaire
   unset secret_value

   read -rs 'secret_value?Key password: '
   echo
   printf '%s' "$secret_value" | gh secret set ANDROID_KEY_PASSWORD --repo arialdev/vocabulaire
   unset secret_value
   ```

4. To update the fingerprint, first display it using the path and alias for the key being uploaded. Enter the keystore password when prompted:

   ```sh
   LC_ALL=C mise exec -- keytool -list -v \
     -keystore "$HOME/Private/vocabulaire-signing/vocabulaire-release.jks" \
     -alias vocabulaire
   ```

   Copy the value on the `SHA256:` line, then run the following block and paste it at the prompt. The fingerprint is public; the block checks its length and hexadecimal characters before setting the secret:

   ```sh
   read 'cert_fingerprint?Certificate SHA-256 fingerprint: '
   cert_fingerprint=${cert_fingerprint//:/}
   if [[ "$cert_fingerprint" =~ '^[[:xdigit:]]{64}$' ]]; then
     printf '%s' "$cert_fingerprint" | gh secret set ANDROID_CERT_SHA256 --repo arialdev/vocabulaire
   else
     echo 'Invalid fingerprint; secret was not changed.'
   fi
   unset cert_fingerprint
   ```

Check the five names with `GH_PAGER=cat gh secret list --repo arialdev/vocabulaire`, then verify a trusted `main` CI build and its signing fingerprint. Updating a GitHub secret alone does not change the keystore or its password: update the underlying keystore and secure backup first when changing credentials, then update all affected secrets together. Keep the same private signing key when changing passwords. Generating a new key is a separate operation and can prevent existing Android installations from updating; plan and verify a supported signing-key rotation before replacing it, particularly if distributing through Google Play.
