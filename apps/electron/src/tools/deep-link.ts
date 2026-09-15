/**
 * Turns a teamcraft:// link into an in-app route, or '' when it isn't a route that can be opened from a link.
 */
export function toAppRoute(link: string): string {
  let route = (link || '').replace(/^teamcraft:\/*/i, '/');
  if (route.length > 1 && route.endsWith('/')) {
    route = route.slice(0, -1);
  }
  // A single leading slash followed by a path: no protocol-relative URLs, backslashes or other schemes.
  if (!/^\/[^/\\]/.test(route)) {
    return '';
  }
  // Overlay and child window routes aren't meant to be opened from links.
  if (route.indexOf('overlay') > -1 || route.indexOf('?child') > -1) {
    return '';
  }
  return route;
}
