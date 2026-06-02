export function makeIcon(id: number): string {
  if (id === 0) {
    return '';
  }
  return `/api/asset?path=ui/icon/${Math.floor(id / 1000).toString().padStart(3, '0')}000/${id.toString().padStart(6, '0')}.tex&format=png`;
}
