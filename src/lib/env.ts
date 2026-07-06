const PLACEHOLDER_VALUES = new Set([
  "changeme",
  "change-me",
  "example",
  "null",
  "todo",
  "undefined",
  "your-client-id",
  "your-client-secret",
  "your-polar-access-token",
  "your_client_id",
  "your_client_secret",
  "your_polar_access_token",
]);

export const getOptionalEnv = (name: string) => {
  const rawValue = process.env[name]?.trim();

  if (!rawValue) {
    return undefined;
  }

  const unquotedValue = rawValue.replace(/^(['"])(.*)\1$/, "$2").trim();

  if (!unquotedValue) {
    return undefined;
  }

  if (PLACEHOLDER_VALUES.has(unquotedValue.toLowerCase())) {
    return undefined;
  }

  return unquotedValue;
};
