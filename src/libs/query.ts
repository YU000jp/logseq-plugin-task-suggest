import { setBlockBreadcrumb } from "./setBlockBreadcrumb"
import { highlightKeywords } from "./highlightKeywords"
import { BlockEntity } from "@logseq/libs/dist/LSPlugin.user"

export async function postProcessResult(
  inputResult,
  needBreadcrumb = true,
  keyword,
  limit = 100,
)
  : Promise<BlockEntity[] | null> {

  if (keyword === "") return null

  const keywords = keyword.split(/ +/) ?? keyword

  // コンテンツ内にキーワードを含んでいるタスクを検索
  const blockResult = (await wordMatchBlocks(keywords) ?? [])
    .map((block) => ({
      content: block.content,
      uuid: block.uuid,
      page: block.page,
      parent: block.parent,
    }))

  // Limit to the first n results.
  const blocks = [
    ...blockResult,
    ...inputResult,
  ].slice(0, limit) as BlockEntity[]


  if (keywords.length > 0) {
    for (const block of blocks) {
      block.highlightContent = highlightKeywords(keywords, block.content)
    }
  }

  if (needBreadcrumb) {
    for (const block of blocks) {
      await setBlockBreadcrumb(block)
    }
  }
  return blocks
}


type BlockResult = {
  content: BlockEntity["content"]
  uuid: BlockEntity["uuid"]
  page: { uuid: BlockEntity["page"]["uuid"] },
  parent: { uuid: BlockEntity["parent"]["uuid"] },
}

const wordMatchBlocks = async (words: string | string[]): Promise<BlockResult[] | null> => {
  const wordArray = Array.isArray(words) ? words : [words]
  const combinedPattern = wordArray.join("|")
  const query = `
          [:find (pull ?b [:block/content :block/uuid {:block/page [:db/id :block/uuid]} {:block/parent [:db/id :block/uuid]}])
           :where
           [?b :block/page ?page]
           [?b :block/parent ?parent]
           [?b :block/uuid ?uuid]
           [?b :block/content ?c]
           [(re-pattern "${combinedPattern}") ?p]
           [(re-find ?p ?c)]]
        `
  const result = await advancedQuery<BlockResult[]>(query)
  return result?.length ? result : null
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
