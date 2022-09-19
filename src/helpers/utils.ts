// Simple Fuzzy string match
// https://codereview.stackexchange.com/a/23905
//
export function fuzzyMatch(str: string, pattern: string) {
  if (!pattern) return true;
  pattern = pattern.replace(/ /g, "").split("").reduce((a, b) => a + ".*" + b);
  return (new RegExp(pattern)).test(str);
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
