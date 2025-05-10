import { format } from "date-fns";
import { buildTagQuery } from "./buildTagQuery";
import { parseDateRange } from "./convertToDate";
import { toStatus } from "./toStatus";


export function buildQuery(q) {
  if (!q) return [];
  const filterIndex = Math.max(q.lastIndexOf(";"), q.lastIndexOf("；"));
  const filter = filterIndex > -1 ? q.substring(filterIndex + 1).trim() : null;
  const conds = (filterIndex > -1 ? q.substring(0, filterIndex) : q)
    .split(/[,，]/)
    .map((s) => s.trim());
  if (conds.length === 1 && !"#@>%[》【".includes(conds[0][0]))
    return [conds[0]];
  const lastCond = conds[conds.length - 1];
  const isCompletionRequest = [">", "》"].includes(lastCond?.[0]);
  const condStr = isCompletionRequest
    ? buildCond(lastCond, 0)
    : conds
      .map((cond, i) => buildCond(cond, i))
      .join("\n")
      .trim();
  if (!condStr) return [];
  const [tagQ, tag] = buildTagQuery(lastCond);
  return [
    `[:find (pull ?b [* {:block/page [:db/id :block/journal-day]}]) :in $ ?includes ?contains ?ge ?le ?gt ?lt :where ${condStr}]`,
    filter,
    tagQ,
    tag,
    isCompletionRequest,
  ];
}
function buildCond(cond, i) {
  if (cond.length < 1) return "";
  if (cond.startsWith("#!") || cond.startsWith("#！")) {
    const name = cond.substring(2).toLowerCase();
    return `[?t${i} :block/name "${name}"] (not [?b :block/refs ?t${i}])`;
  } else if (cond.startsWith("#")) {
    if (cond.length < 2) return "";
    if (cond[1] === "#") {
      const name = cond.substring(2).toLowerCase();
      return `[?t${i} :block/name "${name}"] [?b :block/path-refs ?t${i}]`;
    } else if (cond[1] === ">") {
      const name = cond.substring(2).toLowerCase();
      return `[?t${i} :block/name "${name}"] [?bp :block/refs ?t${i}] [?bp :block/uuid ?uuid] (or [?b :block/uuid ?uuid] [?b :block/parent ?bp])`;
    } else {
      const name = cond.substring(1).toLowerCase();
      return `[?t${i} :block/name "${name}"] [?b :block/refs ?t${i}]`;
    }
  } else if (cond.startsWith(">") || cond.startsWith("》")) {
    if (cond.length < 2) return "";
    const name = cond.substring(1).toLowerCase();
    return `[?t${i} :block/name "${name}"] [?b :block/refs ?t${i}]`;
  } else if (cond.startsWith("@!") || cond.startsWith("@！")) {
    if (cond.length < 3) return "";
    const str = cond.substring(2);
    const op = str.match(/:|：/)?.[0];
    switch (op) {
      case ":":
      case "：": {
        const [name, value] = str
          .split(op)
          .map((s, i) => (i === 0 ? s.trim().toLowerCase() : s.trim()));
        if (!value) break;
        return `[?b :block/content] (not-join [?b ?includes ?contains] [?b :block/properties ?bp${i}] [(get ?bp${i} :${name}) ?v${i}] (or-join [?includes ?contains ?v${i}]
          [(?includes ?v${i} "${value}")]
          [(= ?v${i} ${value})]
          [(?contains ?v${i} "${value}")]))`;
      }
      default:
        break;
    }
    return `[?b :block/content] (not-join [?b] [?b :block/properties ?bp${i}] [(get ?bp${i} :${str})])`;
  } else if (cond.startsWith("@")) {
    if (cond.length < 2) return "";
    const str = cond.substring(1);
    const match = str.match(/:|：|\<=|\>=|\>|\<|=|~|～/);
    const op = match?.[0];
    const opIndex = match?.index;
    switch (op) {
      case ":":
      case "：": {
        const [name, value] = str
          .split(op)
          .map((s, i) => (i === 0 ? s.trim().toLowerCase() : s.trim()));
        if (!value) break;
        return `[?b :block/properties ?bp${i}] [(get ?bp${i} :${name}) ?v${i}] [?b :block/content] (or-join [?includes ?contains ?v${i}]
          [(?includes ?v${i} "${value}")]
          [(= ?v${i} ${value})]
          [(?contains ?v${i} "${value}")])`;
      }
      case "=":
      case "<":
      case ">":
      case ">=":
      case "<=": {
        const [name, value] = str
          .split(op)
          .map((s, i) => (i === 0 ? s.trim().toLowerCase() : s.trim()));
        if (!value) break;
        return `[?b :block/properties ?bp${i}] [(get ?bp${i} :${name}) ?v${i}] (not [?b :block/name]) [(${op} ?v${i} ${value})]`;
      }
      case "~":
      case "～": {
        const [name, dateStr] = [
          str.substring(0, opIndex).trim().toLowerCase(),
          str
            .substring(opIndex + 1)
            .trim()
            .toLowerCase(),
        ];
        if (!dateStr) break;
        const [start, end] = parseDateRange(dateStr);
        if (start == null || end == null) break;
        return `[?b :block/properties ?bp${i}]
          (not [?b :block/name])
          [(get ?bp${i} :${name}) ?v${i}]
          [(?ge ?v${i} ${start.getTime()})] [(?le ?v${i} ${end.getTime()})]`;
      }
      default:
        break;
    }
    return `[?b :block/properties ?bp${i}] [(get ?bp${i} :${str})] [?b :block/content]`;
  } else if (cond.startsWith("[]") || cond.startsWith("【】")) {
    if (cond.length < 3) return "";
    const statuses = toStatus(cond.substring(2).toLowerCase());
    return `[?b :block/marker ?m]${statuses.length > 0
        ? ` (or ${statuses.map((status) => `[(= ?m "${status}")]`).join(" ")})`
        : ""}`;
  } else if (cond.startsWith("%j ")) {
    const dateStr = cond.substring(3).trim().toLowerCase();
    if (!dateStr) return "";
    const [start, end] = parseDateRange(dateStr).map(
      (date) => date && format(date, "yyyyMMdd")
    );
    if (start == null || end == null) return "";
    return `[?j${i} :block/journal-day ?d${i}]
      [(>= ?d${i} ${start})]
      [(<= ?d${i} ${end})]
      (or
        [?b :block/page ?j${i}]
        [?b :block/path-refs ?j${i}])`;
  } else {
    // Defaults to text search.
    return `(or-join [?b ?c] [?b :block/content ?c] (and [?b :block/page ?p] [?p :block/original-name ?c])) [(?includes ?c "${cond}")]`;
  }
}
