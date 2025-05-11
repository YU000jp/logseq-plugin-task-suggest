import { AppGraphInfo } from "@logseq/libs/dist/LSPlugin.user"

export const HISTORY_KEY = "kef-ss-history"

export async function readHistory() {
  const graph = await logseq.App.getCurrentGraph() as AppGraphInfo | null
  if (graph) {
    const key = `${HISTORY_KEY}-${graph.name}`
    let val
    try {
      val = JSON.parse(
        localStorage.getItem(key) ??
        localStorage.getItem(`${HISTORY_KEY}-graph`) ??
        "[]"
      )
    } catch (err) {
      console.error(err)
    }
    if (val == null || !Array.isArray(val)) return []
    return val
  }
}

export async function writeHistory(history) {
  const graph = await logseq.App.getCurrentGraph() as AppGraphInfo | null
  if (graph) {
    const key = `${HISTORY_KEY}-${graph.name}`
    localStorage.setItem(key, JSON.stringify(history))
  }
}
