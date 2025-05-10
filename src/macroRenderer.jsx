import { render } from "preact";
import SmartSearchInput from "./comps/SmartSearchInput";

export async function macroRenderer({ slot, payload: { arguments: args, uuid } }) {
  const type = args[0]?.trim();
  if (type !== ":smartsearch") return;

  const slotEl = parent.document.getElementById(slot);
  if (!slotEl) return;
  const renderered = slotEl.childElementCount > 0;
  if (renderered) return;

  const id = `kef-ss-${slot}`;

  slotEl.style.width = "100%";

  logseq.provideUI({
    key: `ss-${slot}`,
    slot,
    template: `<div id="${id}" class="kef-ss-global kef-ss-inline" style="width: 100%"></div>`,
    reset: true,
    style: {
      cursor: "default",
      flex: "1",
    },
  });

  // Let div root element get generated first.
  setTimeout(async () => {
    const el = parent.document.getElementById(id);
    if (el == null) return;
    render(<SmartSearchInput onClose={() => { }} root={el} />, el);
  }, 0);
}
