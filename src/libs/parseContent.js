import { parse } from "./marked-renderer";


export async function parseContent(content) {
  // Remove properties.
  content = content.replace(/^.+:: .+$/gm, "").trim();

  // Replace block refs with their content.
  let match;
  while ((match = /(?:\(\()(?!\()([^\)]+)\)\)/g.exec(content)) != null) {
    const start = match.index;
    const end = start + match[0].length;
    const refUUID = match[1];
    try {
      const refBlock = await logseq.Editor.getBlock(refUUID);
      if (refBlock == null) break;
      const refFirstLine = refBlock.content.match(/.*/)[0];
      const refContent = await parseContent(refFirstLine);
      content = `${content.substring(0, start)}${refContent}${content.substring(
        end
      )}`;
    } catch (err) {
      // ignore err
      break;
    }
  }

  return content.trim();
}
export async function parseOneLineContent(content) {
  // Use only the first line.
  content = content.match(/.*/)[0];

  // Remove macro renderers.
  content = content.replace(/ \{\{renderer (?:\}[^\}]|[^\}])+\}\}/g, "");

  // Handle markdown.
  content = parse(content);

  // Handle LaTex
  content = content.replaceAll(/(\${1,2})([^\$]+)\1/g, (str, _, expr) => {
    if (parent.window.katex == null) return expr;
    return parent.window.katex.renderToString(expr, { throwOnError: false });
  });

  // Replace block refs with their content.
  let match;
  while ((match = /(?:\(\()(?!\()([^\)]+)\)\)/g.exec(content)) != null) {
    const start = match.index;
    const end = start + match[0].length;
    const refUUID = match[1];
    try {
      const refBlock = await logseq.Editor.getBlock(refUUID);
      if (refBlock == null) break;
      const refFirstLine = refBlock.content.match(/.*/)[0];
      const refContent = await parseContent(refFirstLine);
      content = `${content.substring(0, start)}${refContent}${content.substring(
        end
      )}`;
    } catch (err) {
      // ignore err
      break;
    }
  }

  // Remove page refs
  content = content.replace(/\[\[([^\]]+)\]\]/g, "$1");

  return content.trim();
}
