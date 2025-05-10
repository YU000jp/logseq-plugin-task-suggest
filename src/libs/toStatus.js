export function toStatus(s) {
  const ret = new Set();
  for (const c of s) {
    switch (c) {
      case "n":
        ret.add("NOW");
        break;
      case "l":
        ret.add("LATER");
        break;
      case "t":
        ret.add("TODO");
        break;
      case "i":
        ret.add("DOING");
        break;
      case "d":
        ret.add("DONE");
        break;
      case "w":
        ret.add("WAITING");
        break;
      case "c":
        ret.add("CANCELED");
        break;
      default:
        break;
    }
  }
  return Array.from(ret);
}
