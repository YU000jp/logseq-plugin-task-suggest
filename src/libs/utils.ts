import { BlockEntity } from "@logseq/libs/dist/LSPlugin.user"

export async function persistBlockUUID(block: BlockEntity) {
  if (block.uuid)
    if (block.properties?.id === null) {
      const content = (await logseq.Editor.getBlock(block.uuid))?.content
      await logseq.Editor.updateBlock(
        block.uuid,
        `${content}\nid:: ${block.uuid}`,
      )
    }
}
