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

// Removes dupes from Array of Objs
export function uniqByKey<T>(key: string, arr: T[]) {
  const uniqueValuesSet = new Set();

  return arr.filter((obj) => {
    const isPresentInSet = uniqueValuesSet.has(obj[key as keyof T]);
    uniqueValuesSet.add(obj[key as keyof T]);
    return !isPresentInSet;
  });
}
