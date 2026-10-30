import type { ReactNode, Ref } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { dimPressed } from './press';
import { LampIcon, RibbonIcon, type SidebarKey, TodayIcon } from './Sidebar';
import { colors } from './theme';
import { Txt } from './Txt';

// current: 고른 칸(설정처럼 탭에 없는 화면이면 없다). archiveRef: 오늘 장 처음 한 번 코치마크가 '지난 기록' 탭을 가리킨다
type Props = { current?: SidebarKey; onSelect: (key: SidebarKey) => void; archiveRef?: Ref<View> };

// 휴대폰 맨 아래 탭바. 아이패드·Mac의 사이드바처럼 오늘·하루 마무리·지난 기록을 오간다
export function TabBar({ current, onSelect, archiveRef }: Props) {
  return (
    <View accessibilityRole="tablist" style={styles.bar}>
      <Tab label="오늘" icon={<TodayIcon />} selected={current === 'today'} onPress={() => onSelect('today')} />
      <Tab label="하루 마무리" icon={<LampIcon />} selected={current === 'evening'} onPress={() => onSelect('evening')} />
      <Tab label="지난 기록" icon={<RibbonIcon />} selected={current === 'archive'} onPress={() => onSelect('archive')} tabRef={archiveRef} />
    </View>
  );
}

function Tab({ label, icon, selected, onPress, tabRef }: { label: string; icon: ReactNode; selected: boolean; onPress: () => void; tabRef?: Ref<View> }) {
  return (
    <Pressable ref={tabRef} accessibilityRole="tab" accessibilityState={{ selected }} style={dimPressed(styles.tab)} onPress={onPress}>
      {icon}
      <Txt compact variant={selected ? 'medium' : 'body'} numberOfLines={1} style={[styles.label, selected && styles.labelOn]}>
        {label}
      </Txt>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.line, // 바탕은 비워 둔다: 하루 마무리에서는 등잔 불빛 종이가 비친다
  },
  tab: { flex: 1, minHeight: 56, alignItems: 'center', justifyContent: 'center', gap: 3 },
  label: { fontSize: 12, lineHeight: 16, color: colors.muted },
  labelOn: { color: colors.navy },
});
