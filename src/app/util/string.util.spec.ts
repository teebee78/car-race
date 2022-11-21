import { replaceCharAt } from "./string.util";

describe('replaceCharAt', function() { 

  it('replaces in the beginning', function() {
    expect(replaceCharAt('abcdefg', 0, 'A')).toBe('Abcdefg');
  });

  it('replaces in the middle', function() {
    expect(replaceCharAt('abcdefg', 3, 'D')).toBe('abcDefg');
  });

  it('replaces at the end', function() {
    expect(replaceCharAt('abcdefg', 6, 'G')).toBe('abcdefG');
  });
})