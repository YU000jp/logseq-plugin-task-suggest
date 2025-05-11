import { match } from "pinyin-pro"
import { setBlockBreadcrumb } from "./setBlockBreadcrumb"
import { convertToDate } from "./convertToDate"
import { highlightKeywords } from "./highlightKeywords"


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

function compareDate(dateSet, val, comparator) {
  const date = convertToDate(dateSet)?.getTime()
  return date != null && comparator(date, val)
}

export const ge = (dateSet, val) => compareDate(dateSet, val, (a, b) => a >= b)
export const le = (dateSet, val) => compareDate(dateSet, val, (a, b) => a <= b)
export const gt = (dateSet, val) => compareDate(dateSet, val, (a, b) => a > b)
export const lt = (dateSet, val) => compareDate(dateSet, val, (a, b) => a < b)

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
  const pageName = query?.startsWith("#") && !/,，/.test(query) ? query.substring(1).toLowerCase() : null
  const pageResult = pageName ? (await logseq.DB.datascriptQuery(
    `[:find (pull ?b [*]) :where [?b :block/name "${pageName}"]]`
  ) as any[])
    .flat()
    .map((page) => ({
      ...page,
      content: page["original-name"],
      "pre-block?": true,
      page: { id: page.id },
    })) : []

  // Limit to the first n results.
  const blocks = [
    ...pageResult,
    ...(filter
      ? result.filter(({ content, name }) =>
        filterMatch(filter, content ?? name),
      )
      : result),
  ].slice(0, limit)

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
