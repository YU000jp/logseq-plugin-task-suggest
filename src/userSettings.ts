import { t } from "logseq-l10n";

export const userSettings = () => logseq.useSettingsSchema([
      {// breadcrumbsから除外する単語のリスト（改行区切り）
        key: "tocRemoveWordList",
        title: t("Words to exclude from breadcrumbs"),
        type: "string",
        inputAs: "textarea",
        default: "",
        description: t("Enter words to exclude, separated by line breaks."),
    },
]);
