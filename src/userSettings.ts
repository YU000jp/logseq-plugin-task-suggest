import { t } from "logseq-l10n";

export const userSettings = () => logseq.useSettingsSchema([
  {
    key: "enablePinyin",
    type: "boolean",
    default: false,
    title: t("Enable pinyin matching"),
    description: t("(Chinese only) Whether to enable matching with pinyin."),
  },
      {// breadcrumbsから除外する単語のリスト（改行区切り）
        key: "tocRemoveWordList",
        title: t("Words to exclude from breadcrumbs"),
        type: "string",
        inputAs: "textarea",
        default: "",
        description: t("Enter words to exclude, separated by line breaks."),
    },
]);
