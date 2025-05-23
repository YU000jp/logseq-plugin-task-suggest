import { render } from "preact"
import { booleanDbGraph, booleanLogseqVersionMd, INPUT_ID, inputRef } from "../"
import SmartSearchInput from "./suggest"
import { BlockEntity, IBatchBlock } from "@logseq/libs/dist/LSPlugin.user"

let inputContainer: HTMLElement | null
let textarea: HTMLTextAreaElement | null

const getInputContainer = () => parent.document.getElementById(INPUT_ID)

export function triggerInput() {
  const inputContainer = getInputContainer()
  if (inputContainer && inputContainer.style.display === "block") {
    closeInput()
  } else {
    openInput()
  }
}

export async function openInput(prefilled?) {
  textarea = parent.document.activeElement as HTMLTextAreaElement | null
  if (textarea == null) return
  const editor = textarea.closest(".block-editor")
  if (editor && inputContainer !== null) {
    editor.appendChild(inputContainer)
    inputContainer.style.display = "block"
    inputContainer.querySelector("input")?.select()
    if (prefilled) {
      inputRef.current?.fill(prefilled)
    }
  }
}

export function initializeSearchInput() {
  inputContainer = getInputContainer()
  if (inputContainer === null) return
  render(
    <SmartSearchInput
      ref={inputRef}
      onClose={closeInput}
      root={inputContainer}
    />,
    inputContainer,
  )
}

export async function closeInput(text: string = "") {
  if (inputContainer === null) return

  const logseqVersionMd = booleanLogseqVersionMd() as boolean
  const logseqDbGraph = booleanDbGraph() as boolean

  // For MD graph
  if (text !== "") {
    const elementId =
      logseqVersionMd === false && textarea
        ? await logseq.Editor.getBlock(textarea.id.replace("edit-block-", ""))
        : null
    const currentBLock = elementId
      ? elementId
      : ((await logseq.Editor.getCurrentBlock()) as BlockEntity | null)
    if (currentBLock) {
      const content =
        logseqDbGraph === true
          ? text // dbグラフはマーカーをつけない
          : currentBLock.marker
          ? `${currentBLock.marker} ${text}`
          : `${
              (logseq.settings!.noSignalMarker as string) !== ""
                ? (logseq.settings!.noSignalMarker as string) + " "
                : ""
            }${text}`
      if (logseqDbGraph === true) {
        await logseq.Editor.exitEditingMode(false)
        // 80mm秒待機
        await new Promise((resolve) => setTimeout(resolve, 800))
        await logseq.Editor.updateBlock(currentBLock.uuid, content)
        // 80mm秒待機
        await new Promise((resolve) => setTimeout(resolve, 800))
        await logseq.Editor.editBlock(currentBLock.uuid)
      } else {
        await logseq.Editor.insertBatchBlock(currentBLock.uuid, {
          content,
        } as IBatchBlock)
        if (elementId) await logseq.Editor.removeBlock(currentBLock.uuid)
      }
    }
  }

  // Close
  if (logseqVersionMd) {
    if (textarea) {
      textarea.focus()
      setTimeout(() => {
        if (textarea) textarea.blur()
      }, 100)
    }
  } else {
    if (textarea) {
      textarea.focus()
    }
  }

  if (inputContainer) {
    inputContainer.style.display = "none"
  }
}
