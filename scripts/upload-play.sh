#!/bin/zsh
# 나날 Android 빌드(AAB)를 만들어 Google Play 내부 테스트 트랙에 올린다.
# 버전 코드는 mobile/app.json의 android.versionCode를 미리 올려 둔다(같은 번호는 다시 올라가지 않는다).
# 키 설정(저장소 밖): ~/.playconsole/nanal.env 에
#   PLAY_KEYSTORE, PLAY_KEYSTORE_PASSWORD, PLAY_KEY_ALIAS, PLAY_KEY_PASSWORD  (업로드 키)
#   PLAY_SERVICE_ACCOUNT  (Play 업로드 권한이 있는 서비스 계정 JSON 경로)
#   PLAY_RELEASE_STATUS   (선택, 기본 completed. 앱이 아직 한 번도 게시되지 않은 '초안' 상태면 draft)
# Play API로는 앱의 첫 AAB를 올릴 수 없다. 처음엔 --build-only로 만들어 Play Console에서 직접 올린다.
set -euo pipefail
source ~/.playconsole/nanal.env
ROOT=${0:A:h:h}
OUT=${TMPDIR:-/tmp}/nanal-play
rm -rf "$OUT" && mkdir -p "$OUT"

# RN의 Gradle은 JDK 17에서 돈다(brew install openjdk@17). 셸의 JAVA_HOME이 다른 버전이어도 17을 쓴다.
# SDK는 ANDROID_HOME 또는 기본 위치.
export JAVA_HOME=/opt/homebrew/opt/openjdk@17
export ANDROID_HOME=${ANDROID_HOME:-$HOME/Library/Android/sdk}
[[ -x "$JAVA_HOME/bin/java" ]] || { echo "JDK 17이 없어요: brew install openjdk@17"; exit 1; }
[[ -d "$ANDROID_HOME" ]] || { echo "Android SDK가 없어요: $ANDROID_HOME (docs/release-android.md 참고)"; exit 1; }

cd "$ROOT/mobile"
echo "▸ prebuild"; npx expo prebuild --platform android --clean > "$OUT/prebuild.log" 2>&1
cd android
echo "▸ bundleRelease"; ./gradlew :app:bundleRelease \
  -Pandroid.injected.signing.store.file="$PLAY_KEYSTORE" \
  -Pandroid.injected.signing.store.password="$PLAY_KEYSTORE_PASSWORD" \
  -Pandroid.injected.signing.key.alias="$PLAY_KEY_ALIAS" \
  -Pandroid.injected.signing.key.password="$PLAY_KEY_PASSWORD" > "$OUT/gradle.log" 2>&1
cp app/build/outputs/bundle/release/app-release.aab "$OUT/nanal.aab"

if [[ "${1:-}" == "--build-only" ]]; then
  echo "✓ 만들었어요: $OUT/nanal.aab (Play Console에서 직접 올려 주세요)"; exit 0
fi
VERSION_CODE=$(node -p "require('$ROOT/mobile/app.json').expo.android.versionCode")
echo "▸ upload"; node "$ROOT/scripts/play-upload.mjs" "$OUT/nanal.aab" "$VERSION_CODE" | tee "$OUT/upload.log"
echo "✓ 올렸어요. 로그: $OUT"
