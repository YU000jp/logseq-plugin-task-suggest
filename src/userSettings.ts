import { t } from "logseq-l10n"

export const userSettings = () => logseq.useSettingsSchema([

  {// 編集モードで検出するマーカーの種類
    key: "triggerMarker",
    title: t("Types of markers to be detected in edit mode"),
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
  {// 検索に含めるマーカーの種類
    key: "marker",
    title: t(" Types of markers to be included in the search"),
    type: "string",
    default: "TODO",
    description: `
      For MD graph (both DB version):
      ${t("Choose from \`TODO, LATER, NOW, DOING, WAITING, DONE\`, separated by a blank space.")}
      `,
  },

  {// breadcrumbsを有効にするかどうか
    key: "enableBreadcrumb",
    title: t("Enable breadcrumbs"),
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
