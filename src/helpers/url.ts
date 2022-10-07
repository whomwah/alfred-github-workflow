function isValidHttpUrl(string: string) {
  try {
    new URL(string);
  } catch (_) {
    console.error(`Invalid URL: ${string}`);
    return false;
  }

  return true;
}

export async function openPath(path: string) {
  await Deno.run({ cmd: ["open", path] }).status();
}

export async function openUrlInBrowser(url: string) {
  if (!isValidHttpUrl(url)) return Promise.resolve(true);
  await openPath(url);
}
