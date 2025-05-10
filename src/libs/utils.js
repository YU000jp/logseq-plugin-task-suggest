
export async function persistBlockUUID(block) {
  if (block.properties?.id == null) {
    const content = (await logseq.Editor.getBlock(block.uuid)).content
    await logseq.Editor.updateBlock(
      block.uuid,
      `${content}\nid:: ${block.uuid}`,
    )
  }
}
