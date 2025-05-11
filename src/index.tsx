import "@logseq/libs"
import { setup as l10nSetup, t } from "logseq-l10n"
import { createRef } from "preact"
import { INPUT_ID } from "./libs/cons"
import { macroRenderer } from "./macroRenderer"
import { provideStyles } from "./provideStyles"
import { initializeSearchInput, openInput, triggerInput } from "./triggerInput"
import { userSettings } from "./userSettings"
import { configureUserDateOptions } from "./libs/convertToDate"

export const inputRef = createRef()

async function main() {
  // await l10nSetup({ builtinTranslations: { } })

  await configureUserDateOptions()

  // Set CSS
  provideStyles(INPUT_ID)

  // Setup plugin settings
  userSettings()

  logseq.provideUI({
    key: INPUT_ID,
    path: "#app-container",
    template: `<div id="${INPUT_ID}"></div>`,
    reset: true,
  })

  logseq.App.registerCommandPalette(
    {
      key: "trigger-input",
      label: t("Trigger suggest"),
      keybinding: { binding: "ctrl+space" },
    },
    triggerInput,
  )
  // Let div root element get generated first.
  setTimeout(async () => {
    initializeSearchInput()
  }, 0)

  logseq.App.onMacroRendererSlotted(macroRenderer)

  // logseq.beforeunload(() => {})

  // console.log("#logseq-plugin-task-suggest loaded")
}

const model = {
  openInput,
}

logseq.ready(model, main).catch(console.error)
