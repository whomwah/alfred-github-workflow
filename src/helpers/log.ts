import { writeAllSync } from "@std/io/write-all";

export function log(message: string) {
  const contentBytes = new TextEncoder().encode(message);
  writeAllSync(Deno.stdout, contentBytes);
}
