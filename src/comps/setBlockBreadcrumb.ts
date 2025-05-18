import { BlockEntity, PageEntity } from "@logseq/libs/dist/LSPlugin.user"
import { parseContentForBreadcrumb } from "./parseContent"

interface BreadcrumbItem {
  label: string
  uuid: string
}

export async function setBlockBreadcrumb(block: BlockEntity, logseqVerMd: boolean) {
  const path: BreadcrumbItem[] = []

  if (logseq.settings!.breadcrumbOnlyPageName as boolean === false) {
    let tempBlock: BlockEntity | null = block
    while (tempBlock && tempBlock.page !== null) {

      // Get parent block or page
      if (tempBlock.page.id === tempBlock.parent.id) {

        tempBlock = await logseq.Editor.getBlock(tempBlock.parent.id) as BlockEntity | null // TODO:
        // Skip if tempBlock is null
        if (!tempBlock) continue

        path.unshift({
          label: tempBlock.content,
          uuid: tempBlock.uuid,
        })

      } else {

        tempBlock = await logseq.Editor.getBlock(tempBlock.parent.id) as BlockEntity | null //TODO:
        // Skip if tempBlock is null
        if (!tempBlock) continue

        // Create breadcrumb item
        const label = await parseContentForBreadcrumb(tempBlock.content) as string
        if (label)
          path.unshift({
            label,
            uuid: tempBlock.uuid,
          })
      }

    }
  }
  // ページ名
  if (block.page.id) {
    const page = await logseq.Editor.getPage(block.page.id) as PageEntity | null
    if (page) {
      path.unshift({
        label: page.originalName,
        uuid: page.uuid,
      })
    }
  }
  block.breadcrumb = path
}
