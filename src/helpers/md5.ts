/**
 * Creates a hash from a string using djb2 algorithm.
 * This is a fast, synchronous alternative to async MD5 hashing.
 * Used for generating Alfred item UIDs where cryptographic strength is not required.
 */
export function createHash(data: string): string {
  let hash = 5381;
  for (let i = 0; i < data.length; i++) {
    hash = ((hash << 5) + hash) ^ data.charCodeAt(i);
  }
  return (hash >>> 0).toString(16);
}
