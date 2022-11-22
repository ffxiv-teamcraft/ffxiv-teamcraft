export function makeIcon(id: number): string {
  if (id === 0) {
    return '';
  }
  return `/i/${Math.floor(id / 1000).toString().padStart(3, '0')}000/${id.toString().padStart(6, '0')}.png`;
}
