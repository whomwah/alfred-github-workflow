import { crypto } from "../../deps.ts";

export async function createMd5Hash(data: string) {
  const md5Value = new Uint8Array(
    await crypto.subtle.digest("MD5", new TextEncoder().encode(data)),
  );

  // convert from bin to hex
  const response = Array.from(md5Value)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return response;
}
