// import { parseDateRange } from "./convertToDate"


export function buildQuery(q) {
  if (!q) return []
  const filterIndex = Math.max(q.lastIndexOf(";"), q.lastIndexOf("；"))
  const filter = filterIndex > -1 ? q.substring(filterIndex + 1).trim() : null
  const conds = (filterIndex > -1 ? q.substring(0, filterIndex) : q)
    .split(/[,，]/)
    .map((s) => s.trim())
  if (conds.length === 1 && !"#@>%[》【".includes(conds[0][0]))
    return [conds[0]]
  const lastCond = conds[conds.length - 1]
  const isCompletionRequest = [">", "》"].includes(lastCond?.[0])
  const condStr = isCompletionRequest
    ? buildCond(lastCond, 0)
    : conds
      .map((cond, i) => buildCond(cond, i))
      .join("\n")
      .trim()
  if (!condStr) return []
  return [
    `[:find (pull ?b [* {:block/page [:db/id :block/journal-day]}]) :in $ ?includes ?contains ?ge ?le ?gt ?lt :where ${condStr}]`,
    filter,
    isCompletionRequest,
  ]
}

function buildCond(cond, i) {
  if (cond.length < 1) return ""
  return `(or-join [?b ?c] [?b :block/content ?c] (and [?b :block/page ?p] [?p :block/original-name ?c])) [(?includes ?c "${cond}")]`
  // }
}
