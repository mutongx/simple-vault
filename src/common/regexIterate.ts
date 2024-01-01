type RegexIterateResult = { type: "text", text: string } | { type: "match", match: RegExpExecArray };

export default function *regexIterate(pattern: string, text: string): Generator<RegexIterateResult> {
  const re = new RegExp(pattern, "g");
  let cursor = 0;
  while (true) {
    const match = re.exec(text);
    if (!match) {
      break;
    }
    if (match.index > cursor) {
      yield {type: "text", text: text.substring(cursor, match.index)};
    }
    yield {type: "match", match: match};
    cursor = match.index + match[0].length;
  }
  if (cursor < text.length) {
    yield {type: "text", text: text.substring(cursor)};
  }
}
