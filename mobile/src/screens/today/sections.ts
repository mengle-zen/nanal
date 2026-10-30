import type { Item, ItemKind } from '../../items/repo';
import { moveIndex } from '../../lib/position';

// 오늘 장의 묶음. 진행 중 → 할 일 → 끝낸 일. 옮긴 일·안 하기로 한 일도 손을 뗀 줄이라 끝낸 일 묶음 끝에 둔다
export type Section = 'doing' | 'open' | 'done';
export const SECTIONS: readonly Section[] = ['doing', 'open', 'done'];
export const SECTION_LABEL: Record<Section, string> = { doing: '진행 중', open: '할 일', done: '끝낸 일' };

// head: 묶음 머리글 한 줄(count: 머리글 옆 숫자). item: 공책 줄 하나, scope는 그 줄을 끌어 옮길 수 있는 범위(같은 탭·같은 묶음, 보이는 순서)
export type PageRow =
  | { type: 'head'; key: string; section: Section; count: number }
  | { type: 'item'; key: string; item: Item; scope: string[] };

export function sectionOf(item: Pick<Item, 'status'>): Section {
  if (item.status === 'doing') return 'doing';
  if (item.status === 'open' || item.status === null) return 'open';
  return 'done';
}

// 고른 탭의 줄만 그린다. 할 일 탭은 grouped면 묶음별로 모으고(묶음 안은 적은·끌어 둔 순서 그대로), 아니면 적은 순서 그대로.
// 메모 탭은 늘 적은 순서다. items는 그날 전체 줄(자리값 순)
export function pageRows(items: readonly Item[], tab: ItemKind, grouped: boolean): PageRow[] {
  const mine = items.filter((i) => i.kind === tab);
  if (tab === 'note' || !grouped) {
    const scope = mine.map((i) => i.id);
    return mine.map((item) => ({ type: 'item', key: item.id, item, scope }));
  }
  const rows: PageRow[] = [];
  for (const section of SECTIONS) {
    const group = mine.filter((i) => sectionOf(i) === section);
    if (group.length === 0) continue;
    const scope = group.map((i) => i.id);
    // 끝낸 일 묶음의 숫자는 끝낸 일(✓)만 센다. 옮긴 일·안 하기로 한 일은 끝낸 게 아니다
    const count = section === 'done' ? group.filter((i) => i.status === 'done').length : group.length;
    rows.push({ type: 'head', key: `head:${section}`, section, count });
    for (const item of group) rows.push({ type: 'item', key: item.id, item, scope });
  }
  return rows;
}

// 범위(scope) 안에서 from → to로 옮긴 줄을 그날 전체 순서(dayOrder, 자리값 순)의 몇 번째에 둘지.
// 범위 안 바로 앞 줄 뒤에(맨 앞으로 갔으면 바로 뒤 줄 앞에) 놓는다. 다른 탭·묶음의 줄 사이 자리는 건드리지 않는다
export function dayIndexAfterMove(dayOrder: readonly string[], scope: readonly string[], from: number, to: number): number {
  const id = scope[from];
  const next = moveIndex(scope, from, to);
  const at = next.indexOf(id);
  const rest = dayOrder.filter((x) => x !== id);
  if (next.length === 1) return dayOrder.indexOf(id);
  return at > 0 ? rest.indexOf(next[at - 1]) + 1 : rest.indexOf(next[1]);
}
