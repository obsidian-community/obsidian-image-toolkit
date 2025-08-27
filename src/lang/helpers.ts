import {moment} from "obsidian";
import en from "./locale/en";
import zhCN from "./locale/zh-cn";
import zhTW from "./locale/zh-tw";

const localeMap: { [k: string]: Partial<typeof en> } = {
  en,
  "zh-cn": zhCN,
  "zh-tw": zhTW,
};

const locale = localeMap[moment.locale()];

export function t(str: keyof typeof en): string {
  if (!locale) {
    console.error("[oit] Image toolkit locale not found", moment.locale());
  }

  return (locale && locale[str]) || en[str];
}
