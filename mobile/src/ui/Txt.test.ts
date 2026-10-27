import type { TextStyle } from 'react-native';
import { txtStyle } from './Txt';
import { fonts, HAND, type, typeWide } from './theme';
import { textScaleFor } from './typeScale';

const phone = textScaleFor('compact', false);
const pad = textScaleFor('regular', false);
const flat = (s: unknown) => s as TextStyle;

describe('txtStyle 손글씨 배율', () => {
  it('손글씨는 크기만 HAND배로 줄이고 줄 높이는 그대로 둔다', () => {
    const s = flat(txtStyle(phone, 'handLg'));
    expect(s.fontFamily).toBe(fonts.hand);
    expect(s.fontSize).toBeCloseTo(type.handLg.fontSize * HAND);
    expect(s.lineHeight).toBe(type.handLg.lineHeight);
  });

  it('화면이 준 크기에도 곱한다(한 번만)', () => {
    const s = flat(txtStyle(phone, 'hand', { fontSize: 20, lineHeight: 30 }));
    expect(s.fontSize).toBeCloseTo(20 * HAND);
    expect(s.lineHeight).toBe(30);
  });

  it('넓은 배치는 넓은 눈금으로 키운 뒤 곱한다', () => {
    expect(flat(txtStyle(pad, 'hand')).fontSize).toBeCloseTo(typeWide.hand.fontSize * HAND);
  });

  it('본문 글꼴은 그대로, 다른 variant라도 손글씨 글꼴을 주면 줄인다', () => {
    expect(flat(txtStyle(phone, 'body')).fontSize).toBe(16);
    expect(flat(txtStyle(phone, 'hand', { fontFamily: fonts.body })).fontSize).toBe(22);
    expect(flat(txtStyle(phone, 'body', { fontFamily: fonts.hand, fontSize: 22 })).fontSize).toBeCloseTo(22 * HAND);
  });
});
