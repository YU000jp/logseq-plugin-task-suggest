async function gotoBlock(block, inSidebar = false) {
             if (inSidebar) {
                          if (block["pre-block?"]) {
                                       const page = await logseq.Editor.getPage(block.name ?? block.page.id)
                                       if (page) {
                                                    logseq.Editor.openInRightSidebar(page.uuid)
                                                    return
                                       }
                          } else {
                                       logseq.Editor.openInRightSidebar(block.uuid)
                                       return
                          }
             } else {
                          logseq.App.pushState('page', { name: block.uuid })
             }
}