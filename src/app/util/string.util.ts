export function replaceCharAt(aString: string, index: number, replacement: string): string {
  return aString.substring(0, index)
    + replacement
    + aString.substring(index + 1, aString.length);
}
