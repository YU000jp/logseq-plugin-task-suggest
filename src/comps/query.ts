import { setBlockBreadcrumb } from "./setBlockBreadcrumb"
import { highlightKeywords } from "./highlightKeywords"
import { BlockEntity } from "@logseq/libs/dist/LSPlugin.user"

export async function postProcessResult(
  inputResult: BlockEntity[],
  needBreadcrumb: boolean = true,
  keyword: string,
  limit: number = 100,
)
  : Promise<BlockEntity[] | null> {

  if (keyword === "" ||
    (keyword === " " && logseq.settings!.includeNonTaskBlocks as boolean === true)) return null


  const keywords: string[] = keyword.split(/ +/) ?? [keyword]

  // コンテンツ内にキーワードを含んでいるタスクを検索
  const blockResult = await wordMatchBlocks(keywords, logseq.settings!.includeNonTaskBlocks as boolean) ?? []

  // Limit to the first n results.
  const blocks = [
    ...blockResult,
    ...inputResult,
  ].slice(0, limit) as BlockEntity[] | null

  if (blocks === null) return null

  if (logseq.settings!.enableBreadcrumb as boolean === true && keywords.length > 0)
    for (const block of blocks)
      block.highlightContent = highlightKeywords(keywords, block.content)


  if (needBreadcrumb)
    for (const block of blocks)
      await setBlockBreadcrumb(block)

  return blocks
}


type BlockResult = {
  content: BlockEntity["content"]
  uuid: BlockEntity["uuid"]
  page: { id: BlockEntity["page"]["id"] },
  parent: { id: BlockEntity["parent"]["id"] },
}


const wordMatchBlocks = async (
  words: string | string[],
  includeNonTaskBlocks: boolean
): Promise<BlockResult[] | null> => {

  const wordArray = Array.isArray(words) ? words : [words]
  const combinedPattern = wordArray.join("|")
  const query = `
          [:find (pull ?b [:block/content :block/uuid {:block/page [:db/id]} {:block/parent [:db/id]}])
           :where
           [?b :block/page ?page]
           [?b :block/parent ?parent]
           [?b :block/uuid ?uuid]${includeNonTaskBlocks === false && logseq.settings!.marker !== "" ? `
           [?b :block/marker ?marker]
           [(contains? #{${(logseq.settings!.marker as string).split(" ").map(marker => `"${marker}"`).join(" ")}} ?marker)]
           `: ""}
           [?b :block/content ?c]
           [(re-pattern "${combinedPattern}") ?p]
           [(re-find ?p ?c)]]
        `
  const result = await advancedQuery<BlockResult[]>(query)
  return result?.length ? result
    .filter(block => block.content !== undefined && block.content !== " ")
    .map((block) => {
      return {
        content: logseq.settings!.marker !== "" ?
          block.content.split("\n")[0].replace(new RegExp(`^(${((logseq.settings!.marker as string).split(" ") ?? []).join("|")})\\s*`), '')
          : block.content,
        uuid: block.uuid,
        page: block.page,
        parent: block.parent
      }
    }) : null
}

const advancedQuery = async <T>(query: string, ...input: Array<any>): Promise<T | null> => {
  try {
    const result = await logseq.DB.datascriptQuery(query, ...input)
    return result?.flat() as T
  } catch (err) {
    console.warn("Query execution failed:", err)
    return null
  }
}
