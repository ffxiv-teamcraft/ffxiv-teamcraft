export interface CommentSegment {
  text: string;
  href?: string;
}

export interface CommentLink {
  start: number;
  end: number;
  href: string;
  label: string;
}

/**
 * Returns the url if it's an absolute http(s) url, null otherwise.
 */
export function toSafeHref(url: string): string | null {
  try {
    return ['http:', 'https:'].includes(new URL(url).protocol) ? url : null;
  } catch {
    return null;
  }
}

/**
 * Offsets of a link regex match, without the leading whitespace the regexes capture.
 */
export function getMatchBounds(match: RegExpExecArray): { start: number, end: number } {
  const leadingWhitespace = match[0].length - match[0].trimStart().length;
  return {
    start: match.index + leadingWhitespace,
    end: match.index + match[0].length
  };
}

/**
 * Splits a comment into text and link segments so it can be rendered without HTML.
 * When links overlap, the one starting first wins, then the one listed first.
 */
export function toCommentSegments(message: string, links: CommentLink[]): CommentSegment[] {
  const segments: CommentSegment[] = [];
  let cursor = 0;
  [...links]
    .sort((a, b) => a.start - b.start)
    .forEach(link => {
      if (link.start < cursor) {
        return;
      }
      if (link.start > cursor) {
        segments.push({ text: message.slice(cursor, link.start) });
      }
      segments.push({ text: link.label, href: link.href });
      cursor = link.end;
    });
  if (cursor < message.length) {
    segments.push({ text: message.slice(cursor) });
  }
  return segments;
}
