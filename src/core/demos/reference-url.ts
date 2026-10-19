import { lookup } from "node:dns/promises";
import { request } from "node:https";
import { isIP } from "node:net";

const blockedHost = /^(localhost|.*\.localhost|.*\.local)$/i;
function isPrivateIp(ip: string) {
  const normalized = ip.toLowerCase().replace(/^::ffff:/, "");
  return (
    /^(0\.|10\.|100\.(6[4-9]|[78]\d|9[0-9]|1[01]\d|12[0-7])\.|127\.|169\.254\.|192\.0\.0\.|192\.0\.2\.|192\.168\.|198\.(1[89]|51\.100)\.|203\.0\.113\.|22[4-9]\.|23\d\.|24\d\.|25[0-5]\.)/.test(
      normalized,
    ) ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(normalized) ||
    normalized === "::" ||
    normalized === "::1" ||
    /^f[cd][0-9a-f]{2}:/i.test(normalized) ||
    /^fe80:/i.test(normalized) ||
    /^2001:db8:/i.test(normalized)
  );
}

type Resolver = (hostname: string) => Promise<Array<{ address: string }>>;
const defaultResolver: Resolver = async (hostname) =>
  isIP(hostname) ? [{ address: hostname }] : lookup(hostname, { all: true });

async function resolvedPublicUrl(value: string, resolver: Resolver) {
  const url = new URL(value);
  if (url.protocol !== "https:")
    throw new Error("Reference URLs must use HTTPS.");
  if (url.username || url.password || blockedHost.test(url.hostname))
    throw new Error("Reference URL is not public.");
  const addresses = await resolver(url.hostname);
  if (
    !addresses.length ||
    addresses.some(({ address }) => isPrivateIp(address))
  )
    throw new Error("Reference URL resolves to a private or reserved network.");
  return { url, address: addresses[0].address };
}

export async function validatePublicReferenceUrl(
  value: string,
  resolver: Resolver = defaultResolver,
) {
  return (await resolvedPublicUrl(value, resolver)).url;
}

type Requester = (
  url: URL,
  address: string,
  method: "HEAD" | "GET",
) => Promise<number>;
const pinnedRequester: Requester = (url, address, method) =>
  new Promise((resolve, reject) => {
    const req = request(
      {
        protocol: "https:",
        hostname: address,
        port: url.port || 443,
        path: `${url.pathname}${url.search}`,
        method,
        servername: url.hostname,
        family: isIP(address),
        headers: {
          Host: url.host,
          ...(method === "GET" ? { Range: "bytes=0-0" } : {}),
        },
        timeout: 8_000,
      },
      (response) => {
        response.resume();
        resolve(response.statusCode ?? 0);
      },
    );
    req.once("timeout", () =>
      req.destroy(new Error("Reference verification timed out.")),
    );
    req.once("error", reject);
    req.end();
  });

export async function verifyReferenceUrl(
  value: string,
  requester: Requester = pinnedRequester,
  resolver: Resolver = defaultResolver,
) {
  const { url, address } = await resolvedPublicUrl(value, resolver);
  let status = await requester(url, address, "HEAD");
  if (status === 405 || status === 501)
    status = await requester(url, address, "GET");
  if (status < 200 || status >= 300)
    throw new Error(`Reference could not be verified (${status}).`);
  return {
    url: url.toString(),
    status,
    verifiedAt: new Date().toISOString(),
  };
}
