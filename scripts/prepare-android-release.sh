#!/usr/bin/env bash
set -Eeuo pipefail

[[ "$GITHUB_REF" == refs/heads/main ]] || { echo 'Run the release workflow from main.' >&2; exit 1; }
[[ "$RELEASE_CHANNEL" == stable || "$RELEASE_CHANNEL" == beta ]] || { echo 'Invalid release channel.' >&2; exit 1; }
source_sha=${RELEASE_SOURCE:-$GITHUB_SHA}
[[ "$source_sha" =~ ^[0-9a-f]{40}$ ]] || { echo 'Source must be a full commit SHA.' >&2; exit 1; }
git cat-file -e "$source_sha^{commit}"
git merge-base --is-ancestor "$source_sha" "$GITHUB_SHA" || { echo 'Source is not on main at dispatch.' >&2; exit 1; }
verify_script=$(git show "$source_sha:scripts/verify-ci-apk.sh")
grep -Fq 'CI_VERSION_NAME' <<< "$verify_script" || { echo 'Source does not support release version verification.' >&2; exit 1; }
grep -Fq 'CI_VERSION_CODE' <<< "$verify_script" || { echo 'Source does not support Android version-code verification.' >&2; exit 1; }

releases=$(gh release list --repo "$GITHUB_REPOSITORY" --limit 1000 --json tagName,isDraft,isPrerelease)
stable_tag=$(jq -r '.[] | select(.isDraft == false and .isPrerelease == false) | .tagName | select(test("^v[0-9]+\\.[0-9]+\\.[0-9]+$"))' <<< "$releases" | sort -V | tail -n 1)
baseline=${stable_tag:-v1.0.0-beta}
git merge-base --is-ancestor "$baseline" "$source_sha" || { echo 'Source predates the last stable release.' >&2; exit 1; }
git checkout --detach "$source_sha"

reachable_tag=$(git tag --merged HEAD --sort=-version:refname | grep -E '^v[0-9]+\.[0-9]+\.[0-9]+$' | head -n 1 || true)
[[ "$reachable_tag" == "$stable_tag" ]] || { echo 'Stable tags do not match published releases.' >&2; exit 1; }
git-cliff --config "$RELEASE_CLIFF_CONFIG" "$baseline..HEAD" --strip all > release-notes.md
[[ -s release-notes.md ]] || { echo 'No conventional changes are available for release.' >&2; exit 1; }
base=$(git-cliff --config "$RELEASE_CLIFF_CONFIG" --use-branch-tags --bumped-version)
[[ "$base" =~ ^v[0-9]+\.[0-9]+\.[0-9]+$ ]] || { echo 'Invalid calculated version.' >&2; exit 1; }
version_code=$((1000000 + GITHUB_RUN_NUMBER))
(( version_code <= 2100000000 )) || { echo 'Android version code exceeds the supported limit.' >&2; exit 1; }
version=${base#v}
if [[ "$RELEASE_CHANNEL" == beta ]]; then
  version="$version-beta.$version_code"
fi
tag="v$version"
if git show-ref --verify --quiet "refs/tags/$tag" || jq -e --arg tag "$tag" 'any(.[]; .tagName == $tag)' <<< "$releases" > /dev/null; then
  echo "Release or tag $tag already exists." >&2
  exit 1
fi

while IFS= read -r previous_tag; do
  [[ -n "$previous_tag" ]] || continue
  previous_info=$(gh release download "$previous_tag" --repo "$GITHUB_REPOSITORY" --pattern build-info.txt --output -)
  previous_code=$(sed -n 's/^version_code=//p' <<< "$previous_info")
  [[ "$previous_code" =~ ^[0-9]+$ ]] || { echo "Missing version code in $previous_tag." >&2; exit 1; }
  (( version_code > previous_code )) || { echo "Version code is not newer than $previous_tag." >&2; exit 1; }
done < <(jq -r '.[] | select(.isDraft == false) | .tagName | select(test("^v[0-9]+\\.[0-9]+\\.[0-9]+(-beta\\.[0-9]+)?$"))' <<< "$releases")

{
  echo "source_sha=$source_sha"
  echo "version=$version"
  echo "version_code=$version_code"
  echo "tag=$tag"
} >> "$GITHUB_OUTPUT"
