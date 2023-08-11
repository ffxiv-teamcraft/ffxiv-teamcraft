export function numberToCssColor(input: number): string {
  const masked = input & 0xFFFFFF;
  return `#${(masked & 0xFF).toString(16).padStart(2, '0')}${(masked >> 16).toString(16).padStart(2, '0')}${(masked >> 8 & 0xFF).toString(16).padStart(2, '0')}`;
}
