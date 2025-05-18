import { BlockEntity, PageEntity } from "@logseq/libs/dist/LSPlugin.user"
import { parseContentForBreadcrumb } from "./parseContent"

interface BreadcrumbItem {
  label: string
  uuid: string
}

export async function setBlockBreadcrumb(block: BlockEntity, logseqVerMd: boolean, queryBlockContent: string) {
  if (logseq.settings!.breadcrumbOnlyPageName as boolean === true) {
    return
  }

  const path: BreadcrumbItem[] = []

  // Add page name first
  if (block.page.id !== null) {
    const page = await logseq.Editor.getPage(block.page.id) as PageEntity | null
    if (page) {
      path.push({
        label: page[queryBlockContent === "title" ? "title" : "originalName"] as string,
        uuid: page.uuid,
      })
    }
  }

  // Add block hierarchy if markdown version
  if (logseqVerMd) {
    let tempBlock: BlockEntity | null = block
    while (tempBlock?.page?.id && tempBlock.parent?.id) {
      tempBlock = await logseq.Editor.getBlock(tempBlock.parent.id) as BlockEntity | null
      if (!tempBlock) continue

      const isPageBlock = tempBlock.page.id === tempBlock.parent.id
      const label = isPageBlock
        ? tempBlock[queryBlockContent] as string
        : await parseContentForBreadcrumb(tempBlock[queryBlockContent] as string)

      if (label) {
        path.push({
          label,
          uuid: tempBlock.uuid,
        })
      }
    }
  }

  block.breadcrumb = path.reverse()
}
