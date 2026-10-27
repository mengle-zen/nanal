import { StyleSheet, View } from 'react-native';
import { setGroupByStatus, useGroupByStatus } from '../lib/groupByStatus';
import { SettingsGroup, settingsStyles } from './SettingsGroup';
import { SmallSwitch } from './SmallSwitch';
import { Txt } from './Txt';

const SUB = '진행 중 · 할 일 · 끝낸 일 순서로 묶어요. 끄면 적은 순서 그대로예요';

// 설정의 '보기' 카드: 오늘 장 할 일을 상태별로 묶어 볼지
export function ViewSettings() {
  const grouped = useGroupByStatus();
  return (
    <SettingsGroup label="보기">
      <View style={[settingsStyles.row, styles.row]}>
        <View style={styles.flex}>
          <Txt style={settingsStyles.rowText}>상태별로 모아 보기</Txt>
          <Txt style={settingsStyles.sub}>{SUB}</Txt>
        </View>
        <SmallSwitch label="상태별로 모아 보기" hint={SUB} value={grouped} onChange={setGroupByStatus} />
      </View>
    </SettingsGroup>
  );
}

const styles = StyleSheet.create({
  row: { minHeight: 52, paddingVertical: 4 },
  flex: { flex: 1 },
});
