import { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet } from 'react-native';
import { EASE_OUT } from './motion';
import { colors } from './theme';
import { useReduceMotion } from './useReduceMotion';

// 종이 화면에 맞춘 작은 스위치(40×24). iOS 기본 스위치는 실제로 그려지는 크기가 자리와 달라
// 줄이면 위로 떠 보여서 직접 그린다. 누르는 자리는 hitSlop으로 44pt를 지킨다
export function SmallSwitch({ label, hint, value, disabled, onChange }: { label: string; hint?: string; value: boolean; disabled?: boolean; onChange: (v: boolean) => void }) {
  const reduce = useReduceMotion();
  const pos = useRef(new Animated.Value(value ? 1 : 0)).current;
  useEffect(() => {
    Animated.timing(pos, { toValue: value ? 1 : 0, duration: reduce ? 0 : 160, easing: EASE_OUT, useNativeDriver: true }).start();
  }, [value, reduce, pos]);
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityHint={hint}
      accessibilityState={{ checked: value, disabled }}
      disabled={disabled}
      hitSlop={SWITCH_SLOP}
      onPress={() => onChange(!value)}
      style={[styles.track, value ? styles.trackOn : styles.trackOff]}
    >
      <Animated.View style={[styles.knob, { transform: [{ translateX: pos.interpolate({ inputRange: [0, 1], outputRange: [0, KNOB_TRAVEL] }) }] }]} />
    </Pressable>
  );
}

const SWITCH_W = 40;
const SWITCH_H = 24;
const KNOB = 20;
const KNOB_TRAVEL = SWITCH_W - KNOB - 4;
const SWITCH_SLOP = { top: 10, bottom: 10, left: 4, right: 4 };

const styles = StyleSheet.create({
  track: { width: SWITCH_W, height: SWITCH_H, borderRadius: SWITCH_H / 2, padding: 2, justifyContent: 'center' },
  trackOn: { backgroundColor: colors.navy },
  trackOff: { backgroundColor: colors.dotOff },
  knob: { width: KNOB, height: KNOB, borderRadius: KNOB / 2, backgroundColor: colors.popover, shadowColor: colors.shadow, shadowOpacity: 0.25, shadowRadius: 1.5, shadowOffset: { width: 0, height: 1 } },
});
