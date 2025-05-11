import "@logseq/libs"
// import { setup as l10nSetup, t } from "logseq-l10n"
import { createRef } from "preact"
import { provideStyles } from "./provideStyles"
import { initializeSearchInput, openInput, triggerInput } from "./triggerInput"
import { userSettings } from "./userSettings"
import { AppInfo } from "@logseq/libs/dist/LSPlugin.user"

export const INPUT_ID = "logseq-plugin-task-suggest--input"
let onChangedLock = false
export const inputRef = createRef()
// let currentPageUuid: PageEntity["uuid"] = ""
let logseqVersion: string = "" //バージョンチェック用
let logseqVersionMd: boolean = false //バージョンチェック用

// export const getLogseqVersion = () => logseqVersion //バージョンチェック用
export const booleanLogseqVersionMd = () => logseqVersionMd //バージョンチェック用

async function main() {
  // await l10nSetup({ builtinTranslations: { } })

  // バージョンチェック
  logseqVersionMd = await checkLogseqVersion()

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

  // logseq.App.registerCommandPalette(
  //   {
  //     key: "trigger-input",
  //     label: t("Trigger suggest"),
  //     keybinding: { binding: "ctrl+space" },
  //   },
  //   triggerInput,
  // )

  // TODO: タスクのブロックにカーソルが置かれたとき(編集モード)

  // タスクのブロックを検出した場合にtriggerを発動する
  logseq.DB.onChanged(async ({ blocks }) => {
    if (onChangedLock) return
    onChangedLock = true
    setTimeout(() => {
      onChangedLock = false
    }, 300)
    const findBlock = blocks.find(
      (block) =>
        block.content &&
        block.content.length > 2 &&
        block.content.startsWith("TODO"),
        // 「TODO 文字列」
    ) //TODO:
    // console.log("findBlock: ", findBlock)
    if (findBlock) {
      triggerInput()
    }
  })

  // Let div root element get generated first.
  setTimeout(async () => {
    initializeSearchInput()
  }, 0)

  // logseq.beforeunload(() => {})

  // console.log("#logseq-plugin-task-suggest loaded")
}

const model = {
  openInput,
}

logseq.ready(model, main).catch(console.error)


// バージョンチェック
const checkLogseqVersion = async (): Promise<boolean> => {
  const logseqInfo = (await logseq.App.getInfo("version")) as AppInfo | any
  //  0.11.0もしくは0.11.0-alpha+nightly.20250427のような形式なので、先頭の3つの数値(1桁、2桁、2桁)を正規表現で取得する
  const version = logseqInfo.match(/(\d+)\.(\d+)\.(\d+)/)
  if (version) {
    logseqVersion = version[0] //バージョンを取得
    // console.log("logseq version: ", logseqVersion)

    // もし バージョンが0.10.*系やそれ以下ならば、logseqVersionMdをtrueにする
    if (logseqVersion.match(/0\.[0-10]\.\d+/)) {
      logseqVersionMd = true
      // console.log("logseq version is 0.10.* or lower")
      return true
    } else logseqVersionMd = false
  } else logseqVersion = "0.0.0"
  return false
}
