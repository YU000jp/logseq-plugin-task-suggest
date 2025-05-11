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
import { AppUserConfigs } from "@logseq/libs/dist/LSPlugin.user"

export const inputRef = createRef()

async function main() {
  await setup({ builtinTranslations: { "zh-CN": zhCN } })

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
      label: t("Trigger smartsearch input"),
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

  // console.log("#smartsearch loaded")
}

const model = {
  openInput,
}

logseq.ready(model, main).catch(console.error)


async function configureUserDateOptions() {
  const { preferredDateFormat, preferredStartOfWeek } =
    (await logseq.App.getUserConfigs()) as AppUserConfigs
  const weekStart = (+(preferredStartOfWeek ?? 6) + 1) % 7
  setDateOptions(preferredDateFormat, weekStart)
}
