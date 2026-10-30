import { memo, type Ref, useState } from 'react';
import { Keyboard, Pressable, StyleSheet, TextInput, View } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';
import { type ItemKind, MAX_TEXT } from '../../items/repo';
import { dimPressed } from '../../ui/press';
import { colors, fonts } from '../../ui/theme';
import { useScaledText } from '../../ui/typeScale';

type Props = {
  inputRef?: Ref<TextInput>;
  rowRef?: Ref<View>; // 처음 한 번 코치마크가 가리키는 입력줄
  captureRef?: Ref<View>; // 〃 마이크·연필
  voice?: boolean; // 말로 적기를 쓸 수 있으면 마이크, 아니면 정리해서 넣기
  onCapture?: () => void; // 없으면 마이크·정리 버튼을 두지 않는다
  // 할 일만 받는 칸(언젠가 목록): placeholder·읽는 이름을 바꾼다
  taskOnly?: { placeholder: string; label: string };
  kind?: ItemKind; // 새 줄의 종류. 오늘 장은 할 일·메모 탭(KindTabs)이 정한다
  pill?: boolean; // 휴대폰 오늘 장 아래에 붙는 둥근 입력칸. 아니면 밑줄 한 줄
  // 저장하고 성공 여부를 돌려준다. 성공하면 칸을 비운다.
  onSubmit: (kind: ItemKind, text: string) => Promise<boolean>;
};

// 입력칸. 글자를 칠 때마다 여기만 다시 그려진다(목록 줄은 그대로).
export const Composer = memo(function Composer({ inputRef, rowRef, captureRef, voice = false, onCapture, taskOnly, kind = 'task', pill = false, onSubmit }: Props) {
  const [text, setText] = useState('');
  const inputStyle = useScaledText(styles.input);

  // 빈 칸에서 완료를 누르면 키보드만 내린다
  const submit = async () => {
    if (!text.trim()) {
      Keyboard.dismiss();
      return;
    }
    if (await onSubmit(kind, text)) setText('');
  };

  return (
    <View ref={rowRef} style={pill ? styles.pill : styles.inputRow}>
      {pill && (
        <Svg width={14} height={14} viewBox="0 0 14 14" fill="none" accessible={false}>
          <Path d="M7 2v10M2 7h10" stroke={colors.muted} strokeWidth={1.4} strokeLinecap="round" />
        </Svg>
      )}
      <TextInput
        style={inputStyle}
        ref={inputRef}
        placeholder={taskOnly?.placeholder ?? (kind === 'task' ? '할 일 한 줄' : '메모 한 줄')}
        placeholderTextColor={colors.muted}
        maxLength={MAX_TEXT}
        accessibilityLabel={taskOnly?.label ?? (kind === 'task' ? '새 할 일' : '새 메모')}
        value={text}
        onChangeText={setText}
        onSubmitEditing={submit}
        submitBehavior="submit"
        returnKeyType="done"
      />
      {onCapture && (
        <Pressable
          ref={captureRef}
          accessibilityRole="button"
          accessibilityLabel={voice ? '말로 적기' : '정리해서 넣기'}
          accessibilityHint={voice ? '말한 내용을 할 일과 메모로 정리해요' : '두서없이 쓴 글을 할 일과 메모로 정리해요'}
          style={dimPressed(styles.organize)}
          onPress={onCapture}
        >
          {voice ? (
            <Svg width={22} height={22} viewBox="0 0 18 18" fill="none">
              <Rect x={6} y={1.5} width={6} height={10} rx={3} stroke={colors.inkSoft} strokeWidth={1.4} />
              <Path d="M3 8.5a6 6 0 0 0 12 0M9 14.5v2.5" stroke={colors.inkSoft} strokeWidth={1.4} strokeLinecap="round" />
            </Svg>
          ) : (
            <Svg width={22} height={22} viewBox="0 0 20 20" fill="none">
              <Path d="M4 16l1-4 8.5-8.5a2.1 2.1 0 0 1 3 3L8 15l-4 1Z" stroke={colors.inkSoft} strokeWidth={1.4} strokeLinejoin="round" />
              <Path d="M12 5l3 3" stroke={colors.inkSoft} strokeWidth={1.4} />
            </Svg>
          )}
        </Pressable>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 8, borderBottomWidth: 1, borderBottomColor: colors.ink, paddingBottom: 6 },
  // 휴대폰 아래 입력칸: 옅은 종이색 둥근 칸, 왼쪽에 + 표시
  pill: { flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 48, borderRadius: 24, paddingLeft: 16, backgroundColor: colors.chipSelected },
  input: { flex: 1, minHeight: 44, paddingHorizontal: 6, fontSize: 16, fontFamily: fonts.body, color: colors.ink },
  organize: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
});
