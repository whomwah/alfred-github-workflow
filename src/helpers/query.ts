export interface QueryArgs {
  prefix: string | undefined;
  action: string;
  parts: string[];
  lastPart: string;
  query: string;
  isSubCmd: boolean;
}

export function queryArgs(query: string, prefix?: string): QueryArgs {
  const sanitizedPrefix = prefix?.trim();
  const parts = query
    .substring(prefix ? prefix.length : 0)
    .trim()
    .split(" ");
  const isSubCmd = query.endsWith(" ") || parts.length > 1;

  return {
    prefix: sanitizedPrefix,
    action: parts[0],
    parts,
    lastPart: parts[parts.length - 1],
    query,
    isSubCmd,
  };
}
