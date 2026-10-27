import type { Item, ItemKind, TaskStatus } from '../../items/repo';
import { moveIndex } from '../../lib/position';
import { dayIndexAfterMove, pageRows, sectionOf } from './sections';

const item = (id: string, kind: ItemKind, status: TaskStatus | null): Item => ({
  id,
  date: '2026-10-27',
  kind,
  text: id,
  status,
  priority: false,
  migrated_from: null,
  delay_reason: null,
  position: null,
  created_at: '',
  updated_at: '',
  deleted_at: null,
});

// 적은 순서: 끝낸 일, 할 일, 메모, 진행 중, 할 일, 안 하기, 진행 중
const day = [
  item('a', 'task', 'done'),
  item('b', 'task', 'open'),
  item('n1', 'note', null),
  item('c', 'task', 'doing'),
  item('d', 'task', 'open'),
  item('e', 'task', 'dropped'),
  item('f', 'task', 'doing'),
];
const shape = (rows: ReturnType<typeof pageRows>) => rows.map((r) => (r.type === 'head' ? `#${r.section}` : r.key));

describe('sectionOf', () => {
  it('진행 중·할 일은 제 묶음, 끝낸 일·옮긴 일·안 하기로 한 일은 끝낸 일 묶음', () => {
    expect(sectionOf({ status: 'doing' })).toBe('doing');
    expect(sectionOf({ status: 'open' })).toBe('open');
    for (const status of ['done', 'migrated', 'dropped'] as const) expect(sectionOf({ status })).toBe('done');
  });
});

describe('pageRows', () => {
  it('할 일 탭은 진행 중 → 할 일 → 끝낸 일로 묶고, 묶음 안은 적은 순서 그대로', () => {
    expect(shape(pageRows(day, 'task', true))).toEqual(['#doing', 'c', 'f', '#open', 'b', 'd', '#done', 'a', 'e']);
  });

  it('정렬을 끄면 머리글 없이 적은 순서 그대로, 메모는 빠진다', () => {
    expect(shape(pageRows(day, 'task', false))).toEqual(['a', 'b', 'c', 'd', 'e', 'f']);
  });

  it('메모 탭은 메모만 적은 순서로', () => {
    expect(shape(pageRows(day, 'note', true))).toEqual(['n1']);
  });

  it('빈 묶음은 머리글도 없다', () => {
    expect(shape(pageRows([item('x', 'task', 'open')], 'task', true))).toEqual(['#open', 'x']);
  });

  it('끌어 옮길 수 있는 범위는 같은 묶음의 줄들', () => {
    const rows = pageRows(day, 'task', true);
    const scopeOf = (id: string) => rows.find((r) => r.type === 'item' && r.key === id)!;
    expect(scopeOf('d')).toMatchObject({ scope: ['b', 'd'] });
    expect(scopeOf('e')).toMatchObject({ scope: ['a', 'e'] });
  });
});

describe('dayIndexAfterMove', () => {
  const order = day.map((i) => i.id);
  // 그날 전체 순서에 넣어 본 뒤, 같은 범위의 줄만 골라 보면 범위 안에서 옮긴 순서와 같아야 한다
  const check = (scope: string[], from: number, to: number) => {
    const at = dayIndexAfterMove(order, scope, from, to);
    const next = moveIndex(order, order.indexOf(scope[from]), at);
    expect(next.filter((id) => scope.includes(id))).toEqual(moveIndex(scope, from, to));
    return next;
  };

  it('진행 중 묶음에서 뒤 줄을 맨 앞으로', () => {
    expect(check(['c', 'f'], 1, 0)).toEqual(['a', 'b', 'n1', 'f', 'c', 'd', 'e']);
  });

  it('할 일 묶음에서 앞 줄을 뒤로: 다른 묶음·메모 자리는 그대로', () => {
    expect(check(['b', 'd'], 0, 1)).toEqual(['a', 'n1', 'c', 'd', 'b', 'e', 'f']);
  });

  it('정렬을 끈 할 일 탭에서 옮겨도 메모 사이 자리를 지킨다', () => {
    check(['a', 'b', 'c', 'd', 'e', 'f'], 5, 1);
    check(['a', 'b', 'c', 'd', 'e', 'f'], 0, 5);
  });
});
