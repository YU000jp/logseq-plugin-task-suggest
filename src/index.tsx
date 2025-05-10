import "@logseq/libs"
import { setup, t } from "logseq-l10n"
import { createRef } from "preact"
import { INPUT_ID } from "./libs/cons"
import zhCN from "./translations/zh-CN.json"
import { macroRenderer } from "./macroRenderer"
import { provideStyles } from "./provideStyles"
import { initializeSearchInput, openInput, triggerInput } from "./triggerInput"
import { userSettings } from "./userSettings"
import { setDateOptions } from "./libs/convertToDate"

export const inputRef = createRef()

async function main() {
  await setup({ builtinTranslations: { "zh-CN": zhCN } })

  const { preferredDateFormat, preferredStartOfWeek } =
    await logseq.App.getUserConfigs()
  const weekStart = (+(preferredStartOfWeek ?? 6) + 1) % 7
  setDateOptions(preferredDateFormat, weekStart)

  provideStyles(INPUT_ID)

  userSettings()

  logseq.provideUI({
    key: INPUT_ID,
    path: "#app-container",
    template: `<div id="${INPUT_ID}"></div>`,
    reset: true,
  })

  if (logseq.settings?.shortcut) {
    logseq.App.registerCommandPalette(
      {
        key: "trigger-input",
        label: t("Trigger smartsearch input"),
        keybinding: { binding: "ctrl+space" },
      },
      triggerInput,
    )
  } else {
    logseq.App.registerCommandPalette(
      { key: "trigger-input", label: t("Trigger smartsearch input") },
      triggerInput,
    )
  }

  // Let div root element get generated first.
  setTimeout(async () => {
    initializeSearchInput()
  }, 0)

  logseq.App.onMacroRendererSlotted(macroRenderer)

  // logseq.beforeunload(() => {})

  // console.log("#smartsearch loaded")
}

const model = {
  openInput,
}

logseq.ready(model, main).catch(console.error)
