import { Account, Aptos, AptosConfig, Ed25519Account, Ed25519PrivateKey, Network } from "@aptos-labs/ts-sdk";
import { ShelbyNodeClient } from "@shelby-protocol/sdk/node";
import { SHELBY_USD_FA_ADDRESS, SHELBY_USD_DECIMALS } from "@/lib/constants";
import { sql as getSql } from "@/lib/db";

export { SHELBY_USD_FA_ADDRESS, SHELBY_USD_DECIMALS };

let cachedClient: ShelbyNodeClient | null = null;
let cachedSigner: Ed25519Account | null = null;
let cachedAptos: Aptos | null = null;

export function getAptos(): Aptos {
  if (!cachedAptos) {
    const apiKey = process.env.SHELBY_API_KEY?.trim();
    cachedAptos = new Aptos(
      new AptosConfig({
        network: Network.SHELBYNET,
        fullnode: "https://api.shelbynet.shelby.xyz/v1",
        clientConfig: apiKey ? { API_KEY: apiKey } : undefined,
      })
    );
  }
  return cachedAptos;
}

export function getShelbyClient(): ShelbyNodeClient {
  if (cachedClient) return cachedClient;
  const apiKey = process.env.SHELBY_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("Missing SHELBY_API_KEY env var (get one at geomi.dev).");
  }
  cachedClient = new ShelbyNodeClient({
    network: Network.SHELBYNET,
    apiKey,
    // Confirmed valid via aptos.view() -> <deployer>::location::activated_location_names
    locationHint: "shelbynet-1",
  });
  return cachedClient;
}

export function getServiceSigner(): Ed25519Account {
  if (cachedSigner) return cachedSigner;
  const pk = process.env.SHELBY_PRIVATE_KEY?.trim();
  if (!pk) {
    throw new Error("Missing SHELBY_PRIVATE_KEY env var.");
  }
  cachedSigner = new Ed25519Account({ privateKey: new Ed25519PrivateKey(pk) });
  return cachedSigner;
}

/**
 * Returns a dedicated Shelby account for this wallet address, creating one if
 * it doesn't exist yet. This is custodial (the private key lives server-side
 * in Postgres) because browser wallets can't yet sign Shelby's own
 * BlobOwnerAuth challenge directly — but it does mean each user's uploads run
 * against their own account instead of a single shared one, so one user's
 * balance running dry doesn't block everyone else.
 */
export async function getOrCreateUserShelbyAccount(walletAddress: string): Promise<Ed25519Account> {
  const sql = getSql();
  const [existing] = await sql`
    select private_key from shelby_accounts where wallet_address = ${walletAddress}
  `;
  if (existing) {
    return new Ed25519Account({ privateKey: new Ed25519PrivateKey(existing.private_key as string) });
  }

  const account = Account.generate();
  await sql`
    insert into shelby_accounts (wallet_address, account_address, private_key)
    values (${walletAddress}, ${account.accountAddress.toString()}, ${account.privateKey.toString()})
    on conflict (wallet_address) do nothing
  `;
  const [row] = await sql`select private_key from shelby_accounts where wallet_address = ${walletAddress}`;
  return new Ed25519Account({ privateKey: new Ed25519PrivateKey(row.private_key as string) });
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
