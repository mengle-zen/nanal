import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSyncExternalStore } from 'react';

// 오늘 장의 할 일을 진행 중 → 할 일 → 끝낸 일로 묶어 볼지. 기본은 켬.
// 오늘 화면(목록)과 설정 자리(휴대폰은 계정 시트, 아이패드·Mac은 사이드바)가 같은 값을 본다
export const GROUP_KEY = 'nanal.groupByStatus'; // '0'이면 끔

let value = true;
let loading: Promise<void> | null = null;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

// 처음 구독할 때 한 번 읽는다. 못 읽으면 기본값(켬) 그대로
function load() {
  loading ??= AsyncStorage.getItem(GROUP_KEY)
    .then((v) => {
      value = v !== '0';
      emit();
    })
    .catch(() => {});
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  load();
  return () => {
    listeners.delete(listener);
  };
}

export function useGroupByStatus(): boolean {
  return useSyncExternalStore(subscribe, () => value);
}

export function setGroupByStatus(on: boolean) {
  value = on;
  emit();
  AsyncStorage.setItem(GROUP_KEY, on ? '1' : '0').catch(() => {});
}
