import { removeListWords, removeMarkdownAliasLink, removeMarkdownImage, removeMarkdownLink, replaceOverCharacters } from "./markdown"
import removeMd from "remove-markdown"
import "@logseq/libs"

export const parseContentForBreadcrumb = (content: string): Promise<string> => parseContent(content.split("\n")[0])
export const parseContentForBlock = (content: string): Promise<string> => parseContent(content.split("\n")[0])

async function parseContent(content: string): Promise<string> {

  // Handle markdown
  content = removeMarkdown(content)

  // // Handle LaTex
  // content = content.replaceAll(/(\${1,2})([^\$]+)\1/g, (str, _, expr) => {
  //   if (parent.window.katex == null) return expr
  //   return parent.window.katex.renderToString(expr, { throwOnError: false })
  // })

  // Replace block refs with their content.
  content = await blockRef(content)

  // Remove page refs
  content = content.replace(/\[\[([^\]]+)\]\]/g, "$1")

  // Remove macro renderers.
  content = content.replace(/ \{\{renderer (?:\}[^\}]|[^\}])+\}\}/g, "{{renderer}}")

  return content.trim()
}

const blockRef = async (content: string): Promise<string> => {
  let match
  while ((match = /(?:\(\()(?!\()([^\)]+)\)\)/g.exec(content)) != null) {
    const start = match.index
    const end = start + match[0].length
    const refUUID = match[1]
    try {
      const refBlock = await logseq.Editor.getBlock(refUUID)
      if (refBlock == null) {
        break
      }
      const refFirstLineMatch = refBlock.content.match(/.*/)
      if (refFirstLineMatch) {
        const refFirstLine = refFirstLineMatch[0]
        const refContent = await parseContent(refFirstLine)
        content = `${content.substring(0, start)}${refContent}${content.substring(end)}`
      }
    } catch (err) {
      // ignore err
      break
    }
  }
  return content
}

const removeMarkdown = (content: string): string => {
  let processed = removeMarkdownLink(content)
  processed = removeMarkdownAliasLink(processed)
  processed = replaceOverCharacters(processed)
  processed = removeMarkdownImage(processed)
  if (logseq.settings!.tocRemoveWordList as string !== "") {
    processed = removeListWords(processed, logseq.settings!.tocRemoveWordList as string)
  }

  return removeMd(processed)
}