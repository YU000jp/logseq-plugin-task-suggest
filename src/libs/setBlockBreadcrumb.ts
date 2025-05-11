import { BlockEntity } from "@logseq/libs/dist/LSPlugin.user"
import { parseContentForBreadcrumb } from "./parseContent"

interface BreadcrumbItem {
  label: string
  uuid: string
}

export async function setBlockBreadcrumb(block: BlockEntity) {
  const path: BreadcrumbItem[] = []
  let tempBlock: BlockEntity | null = block
  while (tempBlock && tempBlock.page !== null) {

    // Get parent block or page
    if (tempBlock.page.id === tempBlock.parent.id) {

      tempBlock = await logseq.Editor.getBlock(tempBlock.parent.id) as BlockEntity | null
      // Skip if tempBlock is null
      if (!tempBlock) continue

      path.unshift({
        label: tempBlock.content,
        uuid: tempBlock.uuid,
      })

    } else {

      tempBlock = await logseq.Editor.getBlock(tempBlock.parent.id) as BlockEntity | null
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
  block.breadcrumb = path
}
