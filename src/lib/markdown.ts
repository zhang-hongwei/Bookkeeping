/**
 * Preprocess markdown content to fix CommonMark emphasis parsing
 * with CJK full-width punctuation.
 *
 * CommonMark requires emphasis delimiters (`**`, `*`, `__`, `_`) to be
 * "flanking". When a delimiter is sandwiched between punctuation and
 * non-punctuation (e.g. `）**的`), the flanking rule fails and the
 * delimiter is rendered as literal text.
 *
 * We insert a zero-width space (U+200B) to restore proper flanking.
 */

const ZWSP = "​";

// Closing delimiter: PUNCTUATION**NON_PUNCTUATION → PUNCTUATION<zwsp>**NON_PUNCTUATION
// e.g. ）**的 → ）<zwsp>**的
const CLOSING_RE = /(\p{P})(\*{1,2}|_{1,2})(?=[^\s\p{P}])/gu;

// Opening delimiter: NON_PUNCTUATION**PUNCTUATION → NON_PUNCTUATION**<zwsp>PUNCTUATION
// e.g. 是**， → 是**<zwsp>，
const OPENING_RE = /([^\s\p{P}])(\*{1,2}|_{1,2})(?=\p{P})/gu;

export function fixMarkdownEmphasis(content: string): string {
  return content
    .replace(CLOSING_RE, `$1${ZWSP}$2`)
    .replace(OPENING_RE, `$1$2${ZWSP}`);
}
