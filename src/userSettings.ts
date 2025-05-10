import { t } from "logseq-l10n";

export const userSettings = () => logseq.useSettingsSchema([
  {
    key: "enablePinyin",
    type: "boolean",
    default: false,
    title: t("Enable pinyin matching"),
    description: t("(Chinese only) Whether to enable matching with pinyin."),
  },
]);
