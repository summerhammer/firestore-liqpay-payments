
// MARK: Util

export function utilReplaceTokensInString(
  string: string,
  tokens: Record<string, string | undefined>,
): string {
  function resolve(token: string): string {
    const value = tokens[token];
    if (value == "") {
      return "";
    }
    return value ?? `{${token}}`;
  }
  return string
  .replace(/{(.*?)}/g, (_, token) => resolve(token));
}
