import { render } from "preact"
import { INPUT_ID, inputRef } from "."
import SmartSearchInput from "./comps/SmartSearchInput"

let inputContainer
let inputContainerParent
let textarea

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
  textarea = parent.document.activeElement //as HTMLTextAreaElement | null
  if (textarea == null) return
  const editor = textarea.closest(".block-editor")
  if (editor) {
    editor.appendChild(inputContainer)
    inputContainer.style.display = "block"
    inputContainer.querySelector("input").select()
    if (prefilled) {
      inputRef.current?.fill(prefilled)
    }
  } else {
    inputContainer.classList.add("task-Suggest-global")
    inputContainer.style.display = "block"
    inputContainer.querySelector("input").select()
    if (prefilled) {
      inputRef.current?.fill(prefilled)
    }
    render(
      <SmartSearchInput
        ref={inputRef}
        onClose={closeInput}
        root={inputContainer}
      />,
      inputContainer,
    )
  }
}

async function closeInput(text = "") {
  if (inputContainer.offsetParent == null) return

  const centered = inputContainer.classList.contains("task-Suggest-global")
  inputContainer.style.display = "none"
  inputContainer.classList.remove("task-Suggest-global")
  inputContainerParent.appendChild(inputContainer)
  if (!centered) {
    const pos = textarea.selectionStart
    const newPos = pos + text.length
    if (text) {
      const content = textarea.value
      const currentBLock = await logseq.Editor.getCurrentBlock()
      if (currentBLock)
        await logseq.Editor.updateBlock(
          currentBLock.uuid,
          pos < content.length
            ? `${content.substring(0, pos)}${text}${content.substring(pos)}`
            : pos === content.length
            ? `${content}${text}`
            : `${content} ${text}`,
        )
    }
    textarea.focus()
    textarea.setSelectionRange(newPos, newPos)
  }
}

export function initializeSearchInput() {
  inputContainer = getInputContainer()
  if (inputContainer == null) return
  inputContainerParent = inputContainer.parentNode
  render(
    <SmartSearchInput
      ref={inputRef}
      onClose={closeInput}
      root={inputContainer}
    />,
    inputContainer,
  )
}
