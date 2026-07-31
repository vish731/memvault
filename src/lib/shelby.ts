import { Account, Ed25519Account, Ed25519PrivateKey, Network } from "@aptos-labs/ts-sdk";
import { ShelbyNodeClient } from "@shelby-protocol/sdk/node";

/**
 * This app uses ONE Shelby/Aptos account (a "service account") to store every
 * memory, regardless of which visitor created it. That's the simplest thing
 * that works for a demo deployed on Vercel functions, which have no durable
 * local filesystem to hold a per-user keypair.
 *
 * SHELBY_PRIVATE_KEY should be an Aptos Ed25519 private key
 * (e.g. "ed25519-priv-0x...") for a funded testnet account. Generate one
 * locally with the Shelby CLI (`shelby init`) or Aptos CLI, fund it via the
 * testnet faucets, then paste the private key into your Vercel env vars.
 */
let cachedClient: ShelbyNodeClient | null = null;
let cachedSigner: Ed25519Account | null = null;

export function getShelbyClient(): ShelbyNodeClient {
  if (cachedClient) return cachedClient;
  const apiKey = process.env.SHELBY_API_KEY;
  if (!apiKey) {
    throw new Error("Missing SHELBY_API_KEY env var (get one at geomi.dev).");
  }
  cachedClient = new ShelbyNodeClient({ network: Network.SHELBYNET, apiKey });
  return cachedClient;
}

export function getServiceSigner(): Ed25519Account {
  if (cachedSigner) return cachedSigner;
  const pk = process.env.SHELBY_PRIVATE_KEY;
  if (!pk) {
    throw new Error(
      "Missing SHELBY_PRIVATE_KEY env var. Generate + fund a testnet account, then set its private key here."
    );
  }
  cachedSigner = new Ed25519Account({ privateKey: new Ed25519PrivateKey(pk) });
  return cachedSigner;
}

export async function readAllBytes(readable: ReadableStream): Promise<Buffer> {
  const reader = readable.getReader();
  const chunks: Uint8Array[] = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) chunks.push(value);
  }
  return Buffer.concat(chunks);
}

export { Account };
