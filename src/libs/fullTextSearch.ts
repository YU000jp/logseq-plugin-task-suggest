
export async function fullTextSearch(q) {
  const res = await (logseq.App as any).search(q)
  if (res == null) return []
  const pages = res.pages.map((name) => ({
    "pre-block?": true,
    name,
    content: name,
  }))
  const blocks = (
    await Promise.all(
      res.blocks.map(async (info) => {
        const block = await logseq.Editor.getBlock(info["block/uuid"])
        if (block && block["preBlock?"]) {
          const page = await logseq.Editor.getPage(block.page.id)
          if (page && pages.find(({ name }) => name === page.originalName)) {
            block._remove = true
          } else {
            block["pre-block?"] = true
          }
        }
        return block
      })
    )
  ).filter((block) => !block._remove)
  return [...pages, ...blocks]
}
