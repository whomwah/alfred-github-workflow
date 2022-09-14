import { writeAllSync } from "../deps.ts";

export function log(message: string) {
  const contentBytes = new TextEncoder().encode(message);
  writeAllSync(Deno.stdout, contentBytes);
}
