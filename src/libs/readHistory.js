import { HISTORY_KEY } from "./utils";


export async function readHistory() {
  const graph = (await logseq.App.getCurrentGraph()).name;
  const key = `${HISTORY_KEY}-${graph}`;
  let val;
  try {
    val = JSON.parse(
      localStorage.getItem(key) ??
      localStorage.getItem(`${HISTORY_KEY}-graph`) ??
      "[]"
    );
  } catch (err) {
    console.error(err);
  }
  if (val == null || !Array.isArray(val)) return [];
  return val;
}

export async function writeHistory(history) {
  const graph = (await logseq.App.getCurrentGraph()).name;
  const key = `${HISTORY_KEY}-${graph}`;
  localStorage.setItem(key, JSON.stringify(history));
}
