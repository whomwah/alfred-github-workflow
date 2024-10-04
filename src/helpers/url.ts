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
  const command = new Deno.Command("open", { args: [path] });
  await command.output();
}

export async function openUrlInBrowser(url: string) {
  if (!isValidHttpUrl(url)) return Promise.resolve(true);
  await openPath(url);
}

export function hasCustomSrcPath() {
  return Deno.env.get("INIT_FILE") != "mod.min.js";
}
