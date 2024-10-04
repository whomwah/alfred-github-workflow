import { writeAllSync } from "@std/streams";

export function log(message: string) {
  const contentBytes = new TextEncoder().encode(message);
  writeAllSync(Deno.stdout, contentBytes);
}
