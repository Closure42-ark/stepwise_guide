export interface ParsedHoldMatch {
  key: string
  start: number
  end: number
  seconds: number
  text: string
}

const zhPattern = /(保持|维持|停留)\s*(\d+)\s*(?:\s*(?:-|~|～|到|至)\s*(\d+))?\s*(秒|s|sec|seconds)/gi
const enPattern = /\b(hold|stay|keep)\s*(?:for\s*)?(\d+)\s*(?:\s*(?:-|~|to)\s*(\d+))?\s*(s|sec|second|seconds)\b/gi

function collectMatches(pattern: RegExp, text: string, prefix: string) {
  const matches: ParsedHoldMatch[] = []
  let index = 0

  for (const match of text.matchAll(pattern)) {
    const fullText = match[0]
    const start = match.index ?? -1

    if (start < 0) {
      continue
    }

    const first = Number(match[2] || match[3])
    const second = Number(match[3] || 0)
    const seconds = Math.max(first, second || 0)

    matches.push({
      key: `${prefix}-${index}`,
      start,
      end: start + fullText.length,
      seconds,
      text: fullText,
    })
    index += 1
  }

  return matches
}

export function parseHoldMatches(text: string) {
  return [
    ...collectMatches(zhPattern, text, 'zh'),
    ...collectMatches(enPattern, text, 'en'),
  ].sort((a, b) => a.start - b.start)
}
