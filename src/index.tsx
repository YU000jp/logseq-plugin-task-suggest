import "@logseq/libs"
import { AppInfo } from "@logseq/libs/dist/LSPlugin.user"
import { setup as l10nSetup, t } from "logseq-l10n"
import { createRef } from "preact"
import {
  initializeSearchInput,
  openInput,
  triggerInput,
} from "./comps/triggerInput"
import { provideStyles } from "./provideStyles"
import af from "./translations/af.json"
import de from "./translations/de.json"
import es from "./translations/es.json"
import fr from "./translations/fr.json"
import id from "./translations/id.json"
import it from "./translations/it.json"
import ja from "./translations/ja.json"
import ko from "./translations/ko.json"
import nbNO from "./translations/nb-NO.json"
import nl from "./translations/nl.json"
import pl from "./translations/pl.json"
import ptBR from "./translations/pt-BR.json"
import ptPT from "./translations/pt-PT.json"
import ru from "./translations/ru.json"
import sk from "./translations/sk.json"
import tr from "./translations/tr.json"
import uk from "./translations/uk.json"
import zhCN from "./translations/zh-CN.json"
import zhHant from "./translations/zh-Hant.json"
import { userSettings } from "./userSettings"
import { pullBlockContent } from "./comps/query"

export const INPUT_ID = "logseq-plugin-task-suggest--input"
let onChangedLock = false
export const inputRef = createRef()
// let currentPageUuid: PageEntity["uuid"] = ""
let logseqVersion: string = "" //バージョンチェック用
let logseqVersionMd: boolean = false //バージョンチェック用
let logseqDbGraph: boolean = false

// export const getLogseqVersion = () => logseqVersion //バージョンチェック用
export const booleanLogseqVersionMd = () => logseqVersionMd //バージョンチェック用
export const booleanDbGraph = () => logseqDbGraph //バージョンチェック用

async function main() {
  //多言語化 L10N
  await l10nSetup({
    builtinTranslations: {
      //Full translations
      ja,
      af,
      de,
      es,
      fr,
      id,
      it,
      ko,
      "nb-NO": nbNO,
      nl,
      pl,
      "pt-BR": ptBR,
      "pt-PT": ptPT,
      ru,
      sk,
      tr,
      uk,
      "zh-CN": zhCN,
      "zh-Hant": zhHant,
    },
  })

  // バージョンチェック
  logseqVersionMd = await checkLogseqVersion()
  // DBグラフチェック
  logseqDbGraph = await checkDbGraph()

  // Set CSS
  provideStyles(INPUT_ID, logseqVersionMd)

  // 初回設定用
  if (!logseq.settings)
    setTimeout(() => {
      logseq.UI.showMsg("Setup the Task Suggest plugin", "success", {
        timeout: 3000,
      })
      logseq.showSettingsUI()
    }, 300)

  // Setup plugin settings
  userSettings()

  logseq.provideUI({
    key: INPUT_ID,
    path: "#app-container",
    template: `<div id="${INPUT_ID}"></div>`,
    close: "outside",
    reset: true,
    replace: true,
  })

  if (logseq.settings!.registerShortcut === true)
    logseq.App.registerCommandPalette(
      {
        key: "trigger-input",
        label: t("Trigger for the Task Suggest"),
        keybinding: { binding: "ctrl+space" },
      },
      triggerInput,
    )

  const queryBlockContent = pullBlockContent(logseqVersionMd) as string

  // TODO: タスクのブロックにカーソルが置かれたとき(編集モード)

  // タスクのブロックを検出した場合にtriggerを発動する
  logseq.DB.onChanged(async ({ blocks }) => {
    if (
      onChangedLock ||
      logseqDbGraph === true ||
      (logseqDbGraph === false && logseq.settings!.triggerMarker === "")
    )
      return
    onChangedLock = true
    setTimeout(() => {
      onChangedLock = false
    }, 300)

    const findBlock =
      // logseqDbGraph === true
      //   ? blocks.find(
      //       (block) =>
      //         block.title &&
      //         block.title.length < 2 &&
      //         block["logseq.property/status"], // DBグラフの場合(タスクに変更があった場合) WARN: blocksに含まれないため検出できない
      //     )
      //   :
      blocks.find(
        (block) =>
          block[queryBlockContent] &&
          (block[queryBlockContent] as string).length > 2 &&
          (logseq.settings!.triggerMarker as string)
            .split(" ")
            .some(
              (marker) =>
                block[queryBlockContent] === marker ||
                block[queryBlockContent] === marker + " ",
            ), // 「TODO」or「TODO 」
      )
    // console.log("findBlock: ", findBlock)
    if (findBlock) {
      triggerInput()
    }
  })

  // Let div root element get generated first.
  setTimeout(async () => {
    initializeSearchInput()
  }, 300)

  // logseq.beforeunload(() => {})

  logseq.App.onCurrentGraphChanged(async () => {
    logseqDbGraph = await checkDbGraph()
  })

  // console.log("#logseq-plugin-task-suggest loaded")
}

const model = {
  openInput,
}

// MDモデルかどうかのチェック DBモデルはfalse
const checkLogseqVersion = async (): Promise<boolean> => {
  const logseqInfo = (await logseq.App.getInfo("version")) as AppInfo | any
  //  0.11.0もしくは0.11.0-alpha+nightly.20250427のような形式なので、先頭の3つの数値(1桁、2桁、2桁)を正規表現で取得する
  const version = logseqInfo.match(/(\d+)\.(\d+)\.(\d+)/)
  if (version) {
    logseqVersion = version[0] //バージョンを取得
    // console.log("logseq version: ", logseqVersion)

    // もし バージョンが0.10.*系やそれ以下ならば、logseqVersionMdをtrueにする
    if (logseqVersion.match(/0\.([0-9]|10)\.\d+/)) {
      logseqVersionMd = true
      // console.log("logseq version is 0.10.* or lower")
      return true
    } else logseqVersionMd = false
  } else logseqVersion = "0.0.0"
  return false
}

// DBグラフかどうかのチェック DBグラフだけtrue
const checkDbGraph = async (): Promise<boolean> => {
  const element = parent.document.querySelector(
    "div.block-tags",
  ) as HTMLDivElement | null // ページ内にClassタグが存在する  WARN:: ※DOM変更の可能性に注意
  if (element) {
    logseqDbGraph = true
    return true
  } else logseqDbGraph = false
  return false
}

logseq.ready(model, main).catch(console.error)
