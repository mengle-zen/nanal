import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Polygon } from 'react-native-svg';
import { colors, fonts } from '../../ui/theme';
import { Txt } from '../../ui/Txt';
import { useRuleGap } from './NotebookPage';
import { type Section, SECTION_LABEL } from './sections';

// 손으로 찢어 붙인 테이프: 묶음마다 기울기와 찢긴 끝이 조금씩 다르다(디자인 B안)
const TAPE: Record<Section, { rotate: string; points: string }> = {
  doing: { rotate: '-2deg', points: '3,0 97,6 100,50 96,100 2,94 0,50' },
  open: { rotate: '1.5deg', points: '2,4 98,0 100,50 97,96 3,100 0,50' },
  done: { rotate: '-1deg', points: '3,0 97,4 100,50 98,100 2,96 0,50' },
};

// 오늘 장 묶음 머리글: 마스킹테이프에 손글씨. 공책 한 줄 높이를 차지해 줄 간격이 이어진다
export const TapeLabel = memo(function TapeLabel({ section, count }: { section: Section; count: number }) {
  const gap = useRuleGap();
  const label = SECTION_LABEL[section];
  const tape = TAPE[section];
  return (
    <View accessible accessibilityRole="header" accessibilityLabel={`${label} ${count}개`} style={[styles.row, { minHeight: gap }]}>
      <View style={[styles.tape, { transform: [{ rotate: tape.rotate }] }]}>
        <Svg style={StyleSheet.absoluteFill} viewBox="0 0 100 100" preserveAspectRatio="none" accessible={false}>
          <Polygon points={tape.points} fill={colors.tapeBlue} />
        </Svg>
        <Txt compact style={styles.label}>
          {label}
        </Txt>
      </View>
      <Txt compact variant="medium" style={styles.count}>
        {count}
      </Txt>
    </View>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.ruled,
  },
  tape: { paddingTop: 1, paddingBottom: 2, paddingHorizontal: 13 },
  label: { fontFamily: fonts.hand, fontSize: 20, lineHeight: 26, color: colors.navy },
  count: { fontSize: 12, lineHeight: 16, color: colors.muted },
});
