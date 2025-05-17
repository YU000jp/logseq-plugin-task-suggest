import { t } from "logseq-l10n"

export const userSettings = () => logseq.useSettingsSchema([

  {
    key: "heading0010",
    title: t("Trigger for the Task Suggest"),
    type: "heading",
    description: "",
    default: null,
  },
  {// ショートカットコマンドを登録するかどうか
    key: "registerShortcut",
    title: t("Register a shortcut command"),
    type: "boolean",
    default: true,
    description: `
    default: Ctrl(Cmd) + Space
    ${t("This plugin or the Logseq app must be restarted for this toggle to take effect.")}
    `,
  },
    {// マーカーがついてない場合に、つけるマーカーを指定
    key: "noSignalMarker",
    title: t("If no marker is attached, specify the marker to be attached."),
    type: "string",
    default: "TODO",
    description: "LATER or TODO etc. For the shortcut only.",
  },
  {// 編集モードで検出するマーカーの種類
    key: "triggerMarker",
    title: t("Types of markers to be detected in edit mode"),
    type: "string",
    default: "TODO",
    description: `
      For MD graph (both DB version):
      ${t("Choose from \`TODO, LATER, NOW, DOING, WAITING, DONE\`, separated by a blank space.")}

      ${t("If left blank, no marker detection is performed.")}
      `,
  },

  {
    key: "heading0020",
    title: t("Query conditions for suggestion items"),
    type: "heading",
    description: "",
    default: null,
  },
  {// クエリーに含めるマーカーの種類
    key: "marker",
    title: t("Types of markers to be included in the query"),
    type: "string",
    default: "TODO",
    description: `
      For MD graph (both DB version):
      ${t("Choose from \`TODO, LATER, NOW, DOING, WAITING, DONE\`, separated by a blank space.")}
      `,
  },
  {// タスク以外のブロックも含めるかどうか
    key: "includeNonTaskBlocks",
    title: t("Include non-task blocks"),
    type: "boolean",
    default: false,
    description: t("Enable"),
  },

  {
    key: "heading0030",
    title: t("Reflecting breadcrumbs in the suggestion fields"),
    type: "heading",
    description: "",
    default: null,
  },
  {// breadcrumbsを有効にするかどうか
    key: "enableBreadcrumb",
    title: t("breadcrumbs"),
    type: "boolean",
    default: true,
    description: t("Enable"),
  },
  {// breadcrumbをページ名のみにするかどうか
    key: "breadcrumbOnlyPageName",
    title: t("Whether to make the breadcrumb only the page name"),
    type: "boolean",
    default: true,
    description: t("Enable"),
  },
  {// breadcrumbsから除外する単語のリスト（改行区切り）
    key: "tocRemoveWordList",
    title: t("Words to exclude from breadcrumbs"),
    type: "string",
    inputAs: "textarea",
    default: "",
    description: t("Enter words to exclude, separated by line breaks."),
  },

])
