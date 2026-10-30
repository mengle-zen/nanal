# Google Play 올리기

평소: `mobile/app.json`의 `android.versionCode`를 1 올린 뒤 `scripts/upload-play.sh` → 내부 테스트 트랙에 올라간다.

## 처음 한 번 준비

### 1. 빌드 도구
```sh
brew install openjdk@17
brew install --cask android-commandlinetools
export ANDROID_HOME=$HOME/Library/Android/sdk   # ~/.zshrc 에도 넣어 둔다
sdkmanager --sdk_root=$ANDROID_HOME "platform-tools" "platforms;android-36" "build-tools;36.0.0" "ndk;27.1.12297006" "cmake;3.22.1"
yes | sdkmanager --sdk_root=$ANDROID_HOME --licenses
```
(플랫폼 버전은 prebuild가 만든 `android/build.gradle`의 compileSdk에 맞춘다. 모자라면 Gradle이 받으려다 실패하며 버전을 알려 준다.)

### 2. 업로드 키 (저장소 밖, 잃어버리면 Play Console에서 키 재설정 요청이 필요)
```sh
mkdir -p ~/.playconsole && chmod 700 ~/.playconsole
keytool -genkeypair -v -keystore ~/.playconsole/nanal-upload.jks -alias upload \
  -keyalg RSA -keysize 2048 -validity 10000
```
Play 앱 서명(Play App Signing)을 켜 두면 실제 배포 서명은 Google이 하고, 이 키는 올리는 사람 확인용이다.

### 3. Play Console에 앱 만들기
1. Play Console → 앱 만들기 (패키지 이름은 첫 AAB에서 `nanal.mengle.zen`으로 정해진다)
2. `scripts/upload-play.sh --build-only` → 나온 `nanal.aab`를 **테스트 및 출시 → 내부 테스트**에 직접 올린다. Play API는 앱의 첫 AAB를 받지 않는다.
3. 테스터 이메일 목록을 만들고 참여 링크를 공유한다.

### 4. 업로드용 서비스 계정
1. Google Cloud 콘솔에서 프로젝트를 고르고 **Google Play Android Developer API**를 켠다.
2. 서비스 계정을 만들고 JSON 키를 받아 `~/.playconsole/service-account.json`에 둔다.
3. Play Console → **사용자 및 권한** → 그 서비스 계정 이메일을 초대하고, 나날 앱에 **테스트 트랙 출시** 권한을 준다. 권한이 퍼지는 데 몇 분~하루 걸릴 수 있다.

### 5. `~/.playconsole/nanal.env`
```sh
PLAY_KEYSTORE=$HOME/.playconsole/nanal-upload.jks
PLAY_KEYSTORE_PASSWORD=...
PLAY_KEY_ALIAS=upload
PLAY_KEY_PASSWORD=...
PLAY_SERVICE_ACCOUNT=$HOME/.playconsole/service-account.json
# 앱을 아직 한 번도 검토 제출하지 않은 초안 상태면 draft로 두고, Console에서 직접 출시를 누른다.
PLAY_RELEASE_STATUS=draft
```
`chmod 600 ~/.playconsole/nanal.env`. 키·비밀번호·JSON은 저장소나 채팅에 넣지 않는다.
