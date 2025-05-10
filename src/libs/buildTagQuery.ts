export function buildTagQuery(cond) {
  if (!cond || !["#", ">", "》"].includes(cond[0])) return [];
  const namePart = cond.replace(/^(#(>|#|!|！)?)|\>|》/, "").toLowerCase();
  if (!namePart) return [];
  return [
    `[:find (pull ?b [:block/name :block/uuid]) :in $ ?includes :where [?b :block/name ?name] [(?includes ?name "${namePart}")]]`,
    namePart,
  ];
}
