import { parseOneLineContent } from "./utils";

export async function setBlockBreadcrumb(block) {
  // No breadcrumb for pages.
  if (block["pre-block?"]) return;

  const path = [];
  let tempBlock = block;
  while (tempBlock.parent != null) {
    tempBlock =
      tempBlock.page.id === tempBlock.parent.id
        ? await logseq.Editor.getPage(tempBlock.parent.id)
        : await logseq.Editor.getBlock(tempBlock.parent.id);
    path.unshift({
      label: tempBlock.originalName
        ? tempBlock.originalName
        : await parseOneLineContent(tempBlock.content),
      name: tempBlock.name,
      uuid: tempBlock.uuid,
    });
  }
  block.breadcrumb = path;
}
