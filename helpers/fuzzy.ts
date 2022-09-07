// https://codereview.stackexchange.com/a/23905
export default function fuzzyMatch(str: string, pattern: string) {
  if (!pattern) return true;
  pattern = pattern.replace(/ /g, "").split("").reduce((a, b) => a + ".*" + b);
  return (new RegExp(pattern)).test(str);
}
