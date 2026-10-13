import { getMatchBounds, toCommentSegments, toSafeHref } from './comment-segments';

describe('Comment segments', () => {

  it('Should keep HTML as plain text', () => {
    const message = '<img src=x onerror="alert(1)"><script>alert(2)</script>';
    expect(toCommentSegments(message, [])).toEqual([{ text: message }]);
  });

  it('Should split text around links', () => {
    const url = 'https://ffxivteamcraft.com/db/en/item/2';
    const message = `See ${url} for details`;
    const start = message.indexOf(url);
    expect(toCommentSegments(message, [{ start, end: start + url.length, href: url, label: 'Fire Shard' }])).toEqual([
      { text: 'See ' },
      { text: 'Fire Shard', href: url },
      { text: ' for details' }
    ]);
  });

  it('Should keep the first link when links overlap', () => {
    const message = 'https://ffxivteamcraft.com/db/en/item/2/Fire-Shard';
    const bounds = { start: 0, end: message.length };
    expect(toCommentSegments(message, [
      { ...bounds, href: 'https://ffxivteamcraft.com/db/en/item/2', label: 'Fire Shard' },
      { ...bounds, href: message, label: message }
    ])).toEqual([{ text: 'Fire Shard', href: 'https://ffxivteamcraft.com/db/en/item/2' }]);
  });

  it('Should only accept http and https links', () => {
    expect(toSafeHref('https://ffxivteamcraft.com')).toBe('https://ffxivteamcraft.com');
    expect(toSafeHref('http://example.com/path?q=1')).toBe('http://example.com/path?q=1');
    expect(toSafeHref('javascript:alert(1)')).toBeNull();
    expect(toSafeHref('data:text/html,<script>alert(1)</script>')).toBeNull();
    expect(toSafeHref('not a url')).toBeNull();
  });

  it('Should exclude the leading whitespace captured by link regexes', () => {
    const match = / https:\/\/\S+/.exec('see https://example.com');
    expect(getMatchBounds(match)).toEqual({ start: 4, end: 23 });
  });
});
