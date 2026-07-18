import { describe, expect, it } from 'vitest';
import { formatDate, formatRate } from './format';

describe('formatDate', () => {
  it('日付を日本語表記へ変換する', () => {
    expect(formatDate('2026-07-19')).toBe('2026年7月19日');
  });
});

describe('formatRate', () => {
  it.each([
    [0, '0%'],
    [0.125, '12.5%'],
    [1, '100%'],
  ])('使用率 %s を %s として表示する', (rate, expected) => {
    expect(formatRate(rate)).toBe(expected);
  });
});
