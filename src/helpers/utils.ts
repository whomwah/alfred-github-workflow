import "../alfred.d.ts";

export function fuzzyMatch(haystack: string, needle: string) {
  if (!haystack) return true;

  const hlen = haystack.length;
  const nlen = needle.length;

  if (nlen > hlen) return false;
  if (nlen === hlen) return needle === haystack;

  outer:
  for (let i = 0, j = 0; i < nlen; i++) {
    while (j < hlen) {
      if (haystack.charCodeAt(j++) === needle.charCodeAt(i)) continue outer;
    }
    return false;
  }

  return true;
}

export function uniq(list: Alfred.Item[]) {
  const ids = list.map((o) => o.uid);
  return list.filter(({ uid }, index) => !ids.includes(uid, index + 1));
}

export function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
