import { match } from "pinyin-pro"
import { setBlockBreadcrumb } from "./setBlockBreadcrumb";
export const HISTORY_KEY = "kef-ss-history"


export function includesValue(prop, val) {
  if (prop.toLowerCase == null) return false
  return logseq.settings?.enablePinyin ?? false
    ? match(prop.toLowerCase(), val.toString().toLowerCase(), {
        continuous: true,
      }) != null
    : prop.toLowerCase().includes(val.toLowerCase())
}

export function containsValue(prop, val) {
  if (!Array.isArray(prop)) return false
  const lowerVal = val.toLowerCase()
  return prop.some((v) =>
    logseq.settings?.enablePinyin ?? false
      ? match(v.toLowerCase(), lowerVal, { continuous: true }) != null
      : v.toLowerCase().includes(lowerVal),
  )
}

export function ge(dateSet, val) {
  const date = convertToDate(dateSet)?.getTime()
  if (date == null) return false
  return date >= val
}

export function le(dateSet, val) {
  const date = convertToDate(dateSet)?.getTime()
  if (date == null) return false
  return date <= val
}

export function gt(dateSet, val) {
  const date = convertToDate(dateSet)?.getTime()
  if (date == null) return false
  return date > val
}

export function lt(dateSet, val) {
  const date = convertToDate(dateSet)?.getTime()
  if (date == null) return false
  return date < val
}

function filterMatch(filter, content) {
  if (!filter) return true
  if (!content) return false
  for (let i = 0, j = 0; i < content.length && j < filter.length; i++) {
    const t = filter[j].toLowerCase()
    const c = content[i].toLowerCase()
    if (c !== t) continue
    j++
    if (j >= filter.length) return true
  }
  return false
}

export async function postProcessResult(
  result,
  filter,
  needBreadcrumb = false,
  query,
  isFullTextSearch = false,
  limit = 100,
) {
  const pageResult =
    query?.startsWith("#") && !/,，/.test(query)
      ? (
          await top.logseq.api.datascript_query(
            `[:find (pull ?b [*]) :where [?b :block/name "${query
              .substring(1)
              .toLowerCase()}"]]`,
          )
        )
          .flat()
          .map((page) => ({
            ...page,
            content: page["original-name"],
            "pre-block?": true,
            page: { id: page.id },
          }))
      : []

  // Limit to the first n results.
  const blocks = pageResult
    .concat(
      filter
        ? result.filter(({ content, name }) =>
            filterMatch(filter, content ?? name),
          )
        : result,
    )
    .slice(0, limit)

  if (query) {
    const keywords = isFullTextSearch
      ? query.split(/ +/)
      : query
          .split(/[,，]/)
          .map((s) => s.trim())
          .filter((s) => !"#@>%[》【".includes(s[0]))

    if (keywords.length > 0) {
      for (const block of blocks) {
        block.highlightContent = highlightKeywords(keywords, block.content)
      }
    }
  }

  if (needBreadcrumb) {
    for (const block of blocks) {
      await setBlockBreadcrumb(block)
    }
  }

  return blocks
}

function highlightKeywords(keywords, text) {
  const loweredText = text.toLowerCase()
  keywords = keywords
    .map((keyword) => [loweredText.indexOf(keyword.toLowerCase()), keyword])
    .sort(([a], [b]) => a - b)
  const segments = []
  let lastIndex = 0
  for (const [keywordIndex, keyword] of keywords) {
    segments.push(text.substring(lastIndex, keywordIndex))
    lastIndex = keywordIndex + keyword.length
    segments.push(
      `<span class="kef-ss-keyword-highlight">${text.substring(
        keywordIndex,
        lastIndex,
      )}</span>`,
    )
  }
  segments.push(text.substring(lastIndex))
  return segments.join("")
}
