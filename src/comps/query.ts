import { setBlockBreadcrumb } from "./setBlockBreadcrumb"
import { highlightKeywords } from "./highlightKeywords"
import { BlockEntity } from "@logseq/libs/dist/LSPlugin.user"
import { booleanLogseqVersionMd } from ".."

export async function postProcessResult(
  inputResult: BlockEntity[],
  needBreadcrumb: boolean = true,
  keyword: string,
  limit: number = 100,
)
  : Promise<BlockEntity[] | null> {

  if (keyword === "" ||
    (keyword === " " && logseq.settings!.includeNonTaskBlocks as boolean === true)) return null

  const logseqVerMd = booleanLogseqVersionMd()


  const keywords: string[] = keyword.split(/ +/) ?? [keyword]

  // コンテンツ内にキーワードを含んでいるタスクを検索
  const blockResult = await wordMatchBlocks(keywords, logseq.settings!.includeNonTaskBlocks as boolean, logseqVerMd) ?? []

  // Limit to the first n results.
  const blocks = [
    ...blockResult,
    ...inputResult,
  ].slice(0, limit) as BlockEntity[] | null

  if (blocks === null) return null

  if (logseq.settings!.enableBreadcrumb as boolean === true && keywords.length > 0)
    for (const block of blocks)
      block.highlightContent = highlightKeywords(keywords, block.content)


  if (needBreadcrumb && logseqVerMd === true) // db版未対応 TODO:
    for (const block of blocks)
      await setBlockBreadcrumb(block, logseqVerMd)

  return blocks
}


type BlockResult = {
  content: BlockEntity["content"]
  uuid: BlockEntity["uuid"]
  page: { id: BlockEntity["page"]["id"] },
  parent: { id: BlockEntity["parent"]["id"] },
}

const pullBlockContent = (logseqVerMd: boolean) => logseqVerMd === true ? "content" : "title"


const wordMatchBlocks = async (
  words: string | string[],
  includeNonTaskBlocks: boolean,
  logseqVerMd: boolean,
): Promise<BlockResult[] | null> => {

  const queryBlockContent = pullBlockContent(logseqVerMd) as string


  const wordArray = Array.isArray(words) ? words : [words]
  const combinedPattern = wordArray.join("|")
  const query = `
          [:find (pull ?b [:block/${queryBlockContent} :block/uuid {:block/page [:db/id]} {:block/parent [:db/id]}])
           :where
           [?b :block/page ?page]
           [?b :block/parent ?parent]
           [?b :block/uuid ?uuid]${includeNonTaskBlocks === false && logseq.settings!.marker !== "" ? `
           [?b :block/marker ?marker]
           [(contains? #{${(logseq.settings!.marker as string).split(" ").map(marker => `"${marker}"`).join(" ")}} ?marker)]
           `: ""}
           [?b :block/${queryBlockContent} ?c]
           [(re-pattern "${combinedPattern}") ?p]
           [(re-find ?p ?c)]]
        `
  // console.log(query)
  const result = await advancedQuery<BlockResult[]>(query)
  // console.log(result)
  return result?.length ? result
    .filter(block => block[queryBlockContent] !== undefined && block[queryBlockContent] !== " ")
    .map((block) => {
      return {
        content: logseq.settings!.marker !== "" ?
          block[queryBlockContent].split("\n")[0].replace(new RegExp(`^(${((logseq.settings!.marker as string).split(" ") ?? []).join("|")})\\s*`), '')
          : block[queryBlockContent],
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
