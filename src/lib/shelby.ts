import { Account, Aptos, AptosConfig, Ed25519Account, Ed25519PrivateKey, Network } from "@aptos-labs/ts-sdk";
import { ShelbyNodeClient } from "@shelby-protocol/sdk/node";
import { SHELBY_USD_FA_ADDRESS, SHELBY_USD_DECIMALS } from "@/lib/constants";

export { SHELBY_USD_FA_ADDRESS, SHELBY_USD_DECIMALS };

let cachedClient: ShelbyNodeClient | null = null;
let cachedSigner: Ed25519Account | null = null;
let cachedAptos: Aptos | null = null;

export function getAptos(): Aptos {
  if (!cachedAptos) {
    cachedAptos = new Aptos(new AptosConfig({ network: Network.SHELBYNET }));
  }
  return cachedAptos;
}

export function getShelbyClient(): ShelbyNodeClient {
  if (cachedClient) return cachedClient;
  const apiKey = process.env.SHELBY_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("Missing SHELBY_API_KEY env var (get one at geomi.dev).");
  }
  cachedClient = new ShelbyNodeClient({ network: Network.SHELBYNET, apiKey });
  return cachedClient;
}

export function getServiceSigner(): Ed25519Account {
  if (cachedSigner) return cachedSigner;
  const pk = process.env.SHELBY_PRIVATE_KEY?.trim();
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
