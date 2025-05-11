export function highlightKeywords(keywords: string[], text: string): string {
  const loweredText = text.toLowerCase()
  const keywordPositions: [number, string][] = keywords
    .map((keyword: string) => [loweredText.indexOf(keyword.toLowerCase()), keyword] as [number, string])
    .sort(([a], [b]) => a - b)
  const segments: string[] = []
  let lastIndex = 0
  for (const [keywordIndex, keyword] of keywordPositions) {
    segments.push(text.substring(lastIndex, keywordIndex))
    lastIndex = keywordIndex + keyword.length
    segments.push(
      `<span class="task-Suggest-keyword-highlight">${text.substring(
        keywordIndex,
        lastIndex
      )}</span>`
    )
  }
  segments.push(text.substring(lastIndex))
  return segments.join("")
}
