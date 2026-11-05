/**
 * Tells whether a url belongs to spawnd.gg or one of its subdomains, which host the embedded game shown in the search intro.
 */
export function isSpawndUrl(url: string): boolean {
  try {
    return /^https:\/\/([a-z0-9-]+\.)*spawnd\.gg$/.test(new URL(url).origin);
  } catch {
    return false;
  }
}
