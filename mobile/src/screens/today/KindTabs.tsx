import { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import type { ItemKind } from '../../items/repo';
import { haptic } from '../../ui/haptics';
import { Popover, useAnchor } from '../../ui/Popover';
import { dimPressed } from '../../ui/press';
import { colors } from '../../ui/theme';
import { Txt } from '../../ui/Txt';
import { LegendClose, SymbolLegend } from './SymbolLegend';

const TABS: { kind: ItemKind; label: string }[] = [
  { kind: 'task', label: '할 일' },
  { kind: 'note', label: '메모' },
];

type Props = { kind: ItemKind; counts: Record<ItemKind, number>; onChange: (kind: ItemKind) => void };

// 오늘 장의 할 일·메모 탭. 고른 탭이 목록에 보이는 것과 입력칸에 적을 종류를 함께 정한다. 오른쪽 끝은 기호 설명
export const KindTabs = memo(function KindTabs({ kind, counts, onChange }: Props) {
  const info = useAnchor();
  const pick = (next: ItemKind) => {
    if (next === kind) return;
    haptic.select();
    onChange(next);
  };
  return (
    <View accessibilityRole="tablist" style={styles.row}>
      {TABS.map((t) => {
        const selected = t.kind === kind;
        return (
          <Pressable
            key={t.kind}
            accessibilityRole="tab"
            accessibilityLabel={`${t.label} ${counts[t.kind]}개`}
            accessibilityState={{ selected }}
            hitSlop={SLOP}
            style={dimPressed([styles.tab, selected && styles.tabOn])}
            onPress={() => pick(t.kind)}
          >
            <Txt compact variant={selected ? 'medium' : 'body'} style={selected ? styles.labelOn : styles.label}>
              {t.label}
            </Txt>
            <Txt compact style={styles.count}>
              {counts[t.kind]}
            </Txt>
          </Pressable>
        );
      })}
      <View style={styles.spacer} />
      <Pressable
        ref={info.ref}
        accessibilityRole="button"
        accessibilityLabel="기호 설명"
        accessibilityState={{ expanded: info.anchor !== null }}
        style={dimPressed(styles.info)}
        onPress={info.open}
      >
        <Svg width={18} height={18} viewBox="0 0 20 20" fill="none">
          <Circle cx={10} cy={10} r={8.2} stroke={colors.muted} strokeWidth={1.3} />
          <Path d="M10 9v5" stroke={colors.muted} strokeWidth={1.4} strokeLinecap="round" />
          <Circle cx={10} cy={6.2} r={1.1} fill={colors.muted} />
        </Svg>
      </Pressable>
      <Popover anchor={info.anchor} align="right" width={300} label="기호 설명" onClose={info.close} footer={<LegendClose onPress={info.close} />}>
        <SymbolLegend kind={kind} />
      </Popover>
    </View>
  );
});

const TAB_H = 32;
const SLOP = { top: (44 - TAB_H) / 2, bottom: (44 - TAB_H) / 2 };

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  tab: { minHeight: TAB_H, paddingHorizontal: 14, borderRadius: TAB_H / 2, flexDirection: 'row', alignItems: 'center', gap: 5 },
  tabOn: { backgroundColor: colors.chipSelected },
  label: { fontSize: 14, lineHeight: 20, color: colors.muted },
  labelOn: { fontSize: 14, lineHeight: 20, color: colors.ink },
  count: { fontSize: 12, lineHeight: 16, color: colors.muted },
  spacer: { flex: 1 },
  info: { width: 44, height: 44, marginRight: -12, alignItems: 'center', justifyContent: 'center' },
});
