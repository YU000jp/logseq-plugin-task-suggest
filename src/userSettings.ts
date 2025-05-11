import { t } from "logseq-l10n"

export const userSettings = () => logseq.useSettingsSchema([

  {// タスク以外のブロックも含めるかどうか
    key: "includeNonTaskBlocks",
    title: t("Include non-task blocks"),
    type: "boolean",
    default: false,
    description: t("Enable"),
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
