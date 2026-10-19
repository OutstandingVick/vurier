import { isIP } from "node:net";
import { lookup } from "node:dns/promises";

const blockedHost = /^(localhost|.*\.localhost|.*\.local)$/i;
function isPrivateIp(ip: string) {
  const normalized = ip.toLowerCase().replace(/^::ffff:/, "");
  return (
    /^(10\.|127\.|169\.254\.|192\.168\.|0\.)/.test(normalized) ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(normalized) ||
    normalized === "::1" ||
    /^f[cd][0-9a-f]{2}:/i.test(normalized) ||
    /^fe80:/i.test(normalized)
  );
}

export async function validatePublicReferenceUrl(value: string) {
  const url = new URL(value);
  if (url.protocol !== "https:")
    throw new Error("Reference URLs must use HTTPS.");
  if (url.username || url.password || blockedHost.test(url.hostname))
    throw new Error("Reference URL is not public.");
  const addresses = isIP(url.hostname)
    ? [{ address: url.hostname }]
    : await lookup(url.hostname, { all: true });
  if (
    !addresses.length ||
    addresses.some(({ address }) => isPrivateIp(address))
  )
    throw new Error("Reference URL resolves to a private network.");
  return url;
}

export async function verifyReferenceUrl(
  value: string,
  fetcher: typeof fetch = fetch,
) {
  const url = await validatePublicReferenceUrl(value);
  let response = await fetcher(url, {
    method: "HEAD",
    redirect: "error",
    signal: AbortSignal.timeout(8_000),
    cache: "no-store",
  });
  if (response.status === 405 || response.status === 501) {
    response = await fetcher(url, {
      method: "GET",
      headers: { Range: "bytes=0-0" },
      redirect: "error",
      signal: AbortSignal.timeout(8_000),
      cache: "no-store",
    });
    await response.body?.cancel();
  }
  if (!response.ok)
    throw new Error(`Reference could not be verified (${response.status}).`);
  return {
    url: url.toString(),
    status: response.status,
    verifiedAt: new Date().toISOString(),
  };
}
