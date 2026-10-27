#!/bin/zsh
# 손글씨 글꼴(교보문고 손글씨 2025 이유빈, KyoboHandwriting2025lyb.otf)을 mobile/assets/fonts에 받는다.
# 라이선스가 앱에 넣는 건 허락하지만 글꼴 파일을 복제·배포하는 건 막아서, 공개 저장소에는 올리지 않고(.gitignore)
# 빌드하는 곳(로컬·CI)마다 교보문고 스토어에서 받는다. 이미 있으면 건너뛴다.
# mobile의 npm install(postinstall)과 업로드 스크립트가 부른다. 손으로는 mobile에서 npm run fonts.
set -euo pipefail
ROOT=${0:A:h:h}
DEST=$ROOT/mobile/assets/fonts/KyoboHandwriting2025lyb.otf
NAME=KyoboHandwriting2025lyb # 글꼴 파일 안 이름표(PostScript 이름). 받은 파일이 맞는지 이걸로 가린다
PAGE=https://store.kyobobook.co.kr/handwriting/font
# 스토어 페이지에서 못 찾을 때 쓰는 주소. 스토어가 새로 빌드되면 경로(build-…)가 바뀔 수 있다
FALLBACK=https://contents.kyobobook.co.kr/display/next/ui-store/build-1792991004/_next/static/media/92727ae68bd428cc-s.p.otf

if [[ -s $DEST ]] && LC_ALL=C grep -qaF $NAME $DEST; then
  echo "✓ 손글씨 글꼴이 이미 있어요: ${DEST#$ROOT/}"
  exit 0
fi

mkdir -p ${DEST:h}
TMP=$(mktemp -d)
trap 'rm -rf $TMP' EXIT

# 받아 보고 이름표가 들어 있는 OTF면 제자리에 옮긴다
try() {
  local url=$1
  curl -fsSL --retry 2 -A 'Mozilla/5.0' -o $TMP/font "$url" || return 1
  [[ $(head -c 4 $TMP/font) == OTTO ]] || return 1 # CFF 글꼴(OTF)의 머리
  LC_ALL=C grep -qaF $NAME $TMP/font || return 1
  mv $TMP/font $DEST
  echo "✓ 손글씨 글꼴을 받았어요: ${DEST#$ROOT/} ($url)"
}

# 스토어 페이지에 걸린 글꼴 파일들 가운데 2025 이유빈을 찾는다. 여러 손글씨가 같이 걸려 있어 OTF부터 하나씩 받아 본다
echo "▸ 손글씨 글꼴 찾는 중"
urls=()
if curl -fsSL --retry 2 -A 'Mozilla/5.0' -o $TMP/page.html $PAGE; then
  for ext in otf ttf; do
    urls+=(${(f)"$(grep -oE "https://[^\"' ()]+\\.$ext" $TMP/page.html | sort -u || true)"})
  done
fi
for u in $urls; do
  [[ -n $u ]] && try $u && exit 0
done

echo "▸ 스토어 페이지에서 못 찾아서 정해 둔 주소로 받아요"
try $FALLBACK && exit 0

echo "✗ 손글씨 글꼴($NAME)을 받지 못했어요. $PAGE 에서 받아 ${DEST#$ROOT/} 에 두세요" >&2
exit 1
