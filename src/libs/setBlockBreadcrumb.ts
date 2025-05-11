import { parseOneLineContent } from "./parseContent"

interface BreadcrumbItem {
  label: string
  name: string
  uuid: string
}

export async function setBlockBreadcrumb(block) {
  // No breadcrumb for pages.
  if (block["pre-block?"]) return

  const path: BreadcrumbItem[] = []
  let tempBlock = block
  while (tempBlock.parent != null) {

    // Get parent block or page
    if (tempBlock.page.id === tempBlock.parent.id) {

      tempBlock = await logseq.Editor.getPage(tempBlock.parent.id)
      // Skip if tempBlock is null
      if (!tempBlock) continue

      path.unshift({
        label: tempBlock.originalName,
        name: tempBlock.name,
        uuid: tempBlock.uuid,
      })

    } else {

      tempBlock = await logseq.Editor.getBlock(tempBlock.parent.id)
      // Skip if tempBlock is null
      if (!tempBlock) continue

      // Create breadcrumb item
      const label = await parseOneLineContent(tempBlock.content)
      if (label)
        path.unshift({
          label,
          name: tempBlock.name,
          uuid: tempBlock.uuid,
        })
    }

  }
  block.breadcrumb = path
}
